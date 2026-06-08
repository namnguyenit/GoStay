export interface LogEntry {
  id: string;
  timestamp: Date;
  method: string;
  url: string;
  requestBody?: any;
  requestHeaders?: any;
  responseStatus?: number;
  responseBody?: any;
  error?: string;
  duration?: number;
}

type LogListener = (log: LogEntry) => void;

class ApiClient {
  private listeners: LogListener[] = [];
  private token: string | null = null;
  public baseUrl = '/api';

  public setToken(token: string) {
    this.token = token;
  }

  public subscribe(listener: LogListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(log: LogEntry) {
    this.listeners.forEach(l => l(log));
  }

  public async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as any)
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
    }

    let parsedBody = options.body;
    if (typeof options.body === 'string') {
      try {
        parsedBody = JSON.parse(options.body);
      } catch (e) {
        parsedBody = options.body;
      }
    }

    const logEntry: any = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
      method: options.method || 'GET',
      url,
      requestHeaders: headers,
      requestBody: options.body instanceof FormData ? 'FormData' : parsedBody
    };

    const startTime = performance.now();

    try {
      const response = await fetch(url, { ...options, headers });
      const duration = performance.now() - startTime;
      
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((val, key) => { responseHeaders[key] = val; });
      logEntry.responseHeaders = responseHeaders;
      logEntry.responseStatus = response.status;
      logEntry.duration = Math.round(duration);

      const contentType = response.headers.get('content-type');
      let responseBody;
      if (contentType && contentType.includes('application/json')) {
        responseBody = await response.json();
      } else {
        responseBody = await response.text();
      }

      logEntry.responseBody = responseBody;
      this.notify(logEntry);

      if (!response.ok) {
        const errorMessage = responseBody?.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      return responseBody;
    } catch (error: any) {
      // Only notify if we haven't already
      if (!logEntry.responseStatus) {
        const duration = performance.now() - startTime;
        logEntry.error = error.message;
        logEntry.duration = Math.round(duration);
        this.notify(logEntry);
      }
      throw error;
    }
  }

  // Auth
  public login(data: any) { return this.request('/auth/login', { method: 'POST', body: JSON.stringify(data) }); }
  
  // Users
  public createUser(data: any) { return this.request('/users', { method: 'POST', body: JSON.stringify(data) }); }
  public getUsers(page = 0, size = 10, status = 'ACTIVE') { return this.request(`/users?page=${page}&size=${size}&status=${status}`); }
  public getHostsPending(page = 0, size = 10, status = 'PENDING') { return this.request(`/users/hosts?page=${page}&size=${size}&status=${status}`); }
  public getAllHosts(page = 0, size = 10) { return this.request(`/users/hosts/all?page=${page}&size=${size}`); }
  public getHostDetail(accountId: string) { return this.request(`/users/hosts/${accountId}`); }
  
  public approveHostStatus(accountId: string, type: string, status: string) {
    return this.request(`/users/${accountId}/approvalstatus?type=${type}`, { method: 'PUT', body: JSON.stringify({ status }) });
  }
  public updateAccountStatus(accountId: string, status: string) {
    return this.request(`/users/accounts/${accountId}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
  }
  public deleteAccount(id: string) { return this.request(`/users/admin/${id}`, { method: 'DELETE' }); }
  public banAccount(id: string) { return this.request(`/users/admin/${id}`, { method: 'PATCH' }); }
  public upgradeRole(id: string, role: string) { return this.request(`/users/${id}/upgraderole?role=${role}`, { method: 'POST' }); }
  public successUpgradeToHost(id: string) { return this.request(`/users/${id}/successupgradetohost`, { method: 'POST' }); }
  
  // Me
  public getMyInfo() { return this.request('/users/me'); }
  public updateMyInfo(data: any) { return this.request('/users/me', { method: 'PUT', body: JSON.stringify(data) }); }
  public getMyProfile() { return this.request('/users/me/profile'); }
  public updateMyProfile(data: any) { return this.request('/users/me/profile', { method: 'PUT', body: JSON.stringify(data) }); }
  
  public upgradeToHost(data: any) { return this.request('/users/me/upgradetohost', { method: 'POST', body: JSON.stringify(data) }); }
  public deleteProfileUpgradeToHost() { return this.request('/users/me/upgradetohost', { method: 'DELETE' }); }
  public upgradeToEnterprise(data: any) { return this.request('/users/me/upgradetoenterprise', { method: 'POST', body: JSON.stringify(data) }); }
  
  public getMyHostProfile() { return this.request('/users/me/host-profile'); }
  public updateMyHostProfile(data: any) { return this.request('/users/me/host-profile', { method: 'PUT', body: JSON.stringify(data) }); }
  public getMyEnterpriseProfile() { return this.request('/users/me/enterprise-profile'); }
  public updateMyEnterpriseProfile(data: any) { return this.request('/users/me/enterprise-profile', { method: 'PUT', body: JSON.stringify(data) }); }
  
  public uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.request('/users/me/avatar', { method: 'POST', body: formData });
  }
}

export const api = new ApiClient();

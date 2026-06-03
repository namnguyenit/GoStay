import { env } from "@/config";
import Cookies from "js-cookie";

const getToken = () => Cookies.get("access_token");

const request = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  
  const isFormData = options.body instanceof FormData;
  if (!isFormData) {
    headers.set("Content-Type", "application/json");
  }
  
  // Không gửi token Authorization đối với các API public như login, register
  const isPublicEndpoint = (endpoint.startsWith("/v1/auth/") && !endpoint.includes("refresh-roles")) || endpoint.includes(".well-known");
  if (token && !isPublicEndpoint) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${env.apiUrl}${endpoint}`, {
    ...options,
    headers,
  });

  const handleAuthError = (currentToken: string | undefined) => {
    if (typeof window !== "undefined") {
      Cookies.remove("access_token");
      Cookies.remove("refresh_token");
      Cookies.remove("user_roles");
      Cookies.remove("user_info");
      
      const path = window.location.pathname;
      if (path.startsWith("/admin") || path.startsWith("/host")) {
        window.location.href = "/";
      } else {
        // Reload page to show Login button if it had a token before
        if (currentToken) {
          window.location.reload();
        }
      }
    }
  };

  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await res.text();
    
    // Xử lý lỗi từ Security Filter hoặc Gateway trả về không có body JSON
    if (res.status === 401) {
      handleAuthError(token);
      throw {
        success: false,
        status: 401,
        code: "UNAUTHENTICATED",
        message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại."
      };
    }
    if (res.status === 403) {
      handleAuthError(token);
      throw {
        success: false,
        status: 403,
        code: "FORBIDDEN",
        message: "Bạn không có quyền truy cập chức năng này."
      };
    }
    
    throw {
      success: false,
      status: res.status,
      code: "API_ERROR",
      message: text || `API response is not JSON. Status: ${res.status}`
    };
  }

  const json = await res.json();
  if (!res.ok) {
    if (res.status === 401 || res.status === 403 || json.code === 'AUTH_INVALID_TOKEN' || json.errorCode === 'AUTH_INVALID_TOKEN') {
      handleAuthError(token);
    }
    throw json;
  }
  return json;
};

const Api = {
  get: async (endpoint: string) => {
    try {
      return await request(endpoint, { method: "GET" });
    } catch (error: any) {
      console.error(`GET API:`, error);
      throw error;
    }
  },
  post: async (endpoint: string, body: any, options: RequestInit = {}) => {
    try {
      const isFormData = body instanceof FormData;
      return await request(endpoint, {
        method: "POST",
        body: isFormData ? body : JSON.stringify(body),
        ...options,
        headers: {
          ...options.headers,
        }
      });
    } catch (error: any) {
      console.error(`POST API:`, error);
      throw error;
    }
  },
  put: async (endpoint: string, body: any, options: RequestInit = {}) => {
    try {
      const isFormData = body instanceof FormData;
      return await request(endpoint, {
        method: "PUT",
        body: isFormData ? body : JSON.stringify(body),
        ...options,
        headers: {
          ...options.headers,
        }
      });
    } catch (error: any) {
      console.error(`PUT API:`, error);
      throw error;
    }
  },
  delete: async (endpoint: string) => {
    try {
      return await request(endpoint, { method: "DELETE" });
    } catch (error: any) {
      console.error(`DELETE API:`, error);
      throw error;
    }
  },
  patch: async (endpoint: string, body: any, options: RequestInit = {}) => {
    try {
      const isFormData = body instanceof FormData;
      return await request(endpoint, {
        method: "PATCH",
        body: isFormData ? body : JSON.stringify(body),
        ...options,
        headers: {
          ...options.headers,
        }
      });
    } catch (error: any) {
      console.error(`PATCH API:`, error);
      throw error;
    }
  },
};

export default Api;

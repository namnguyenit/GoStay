export interface ITokenStorage {
  getToken(): string | null;
  setToken(token: string): void;
  clear(): void;
}

export class LocalTokenStorage implements ITokenStorage {
  private readonly TOKEN_KEY = "token";

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  clear(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }
}

import type {
  IAuthService,
  LoginDTO,
  RegisterDTO,
} from "../port/auth.service.interface";
import { UserEntity } from "../../domain/entity/user.entity";
import type { ITokenStorage } from "../../infrastructure/storage/token.storage";

export class AuthService implements IAuthService {
  private readonly apiBaseUrl: string;
  private readonly tokenStorage: ITokenStorage;

  constructor(apiBaseUrl: string, tokenStorage: ITokenStorage) {
    this.apiBaseUrl = apiBaseUrl;
    this.tokenStorage = tokenStorage;
  }

  async login(dto: LoginDTO): Promise<string> {
    const res = await fetch(`${this.apiBaseUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });

    const json = await res.json();
    if (!res.ok || json.success === false) {
      throw new Error(json.message || "Đăng nhập không thành công");
    }

    const token = json.data?.token || json.token;
    if (!token) {
      throw new Error("Không nhận được token từ Gateway");
    }

    this.tokenStorage.setToken(token);
    return token;
  }

  async register(dto: RegisterDTO): Promise<void> {
    const res = await fetch(`${this.apiBaseUrl}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });

    const json = await res.json();
    if (!res.ok || json.success === false) {
      throw new Error(json.message || "Đăng ký không thành công");
    }
  }

  async getMe(): Promise<UserEntity> {
    const token = this.tokenStorage.getToken();
    const res = await fetch(`${this.apiBaseUrl}/api/v1/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      throw new Error("Phiên đăng nhập đã hết hạn");
    }

    const json = await res.json();
    const raw = json.data || json;
    const profile = raw.userProfile || {};

    const userEntity = new UserEntity({
      id: raw.id || "usr_me",
      username: raw.username,
      email: raw.email || "",
      fullName:
        profile.fullName ||
        raw.fullName ||
        raw.username ||
        raw.email ||
        "Người dùng",
      role: Array.isArray(raw.roles) ? raw.roles[0] : raw.role || "USER",
    });

    return userEntity;
  }

  logout(): void {
    this.tokenStorage.clear();
  }

  getToken(): string | null {
    return this.tokenStorage.getToken();
  }
}

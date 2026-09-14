import type {
  IUserService,
  UpdateProfileDTO,
} from "../port/user.service.interface";
import { UserProfileEntity } from "../../domain/entity/user-profile.entity";
import { tokenStorage } from "@/modules/auth/composition";

export class UserService implements IUserService {
  private readonly apiBaseUrl: string;

  constructor(apiBaseUrl: string) {
    this.apiBaseUrl = apiBaseUrl;
  }

  async getProfile(): Promise<UserProfileEntity> {
    const token = tokenStorage.getToken();
    const res = await fetch(this.apiBaseUrl + "/api/v1/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: "Bearer " + token } : {}),
      },
    });

    if (!res.ok) {
      throw new Error("Không thể tải thông tin trang cá nhân");
    }

    const json = await res.json();
    const raw = json.data || json;
    const profile = raw.userProfile || {};

    return new UserProfileEntity({
      id: raw.id || "usr_me",
      username: raw.username || "user",
      email: raw.email || "",
      fullName:
        profile.fullName || raw.fullName || raw.username || "Người dùng",
      phoneNumber: profile.phoneNumber || raw.phoneNumber || "",
      address: profile.address || raw.address || "",
      role: Array.isArray(raw.roles) ? raw.roles[0] : raw.role || "USER",
      avatarUrl: profile.avatarUrl || raw.avatarUrl,
      createdAt: raw.createdAt || new Date().toISOString(),
    });
  }

  async updateProfile(dto: UpdateProfileDTO): Promise<UserProfileEntity> {
    const token = tokenStorage.getToken();
    const res = await fetch(this.apiBaseUrl + "/api/v1/me/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: "Bearer " + token } : {}),
      },
      body: JSON.stringify(dto),
    });

    if (!res.ok) {
      throw new Error("Cập nhật thông tin thất bại");
    }

    const json = await res.json();
    const raw = json.data || json;
    const profile = raw.userProfile || raw;

    return new UserProfileEntity({
      id: raw.id || "usr_me",
      username: raw.username || "user",
      email: raw.email || "",
      fullName: profile.fullName || dto.fullName || "Người dùng",
      phoneNumber: profile.phoneNumber || dto.phoneNumber || "",
      address: profile.address || dto.address || "",
      role: Array.isArray(raw.roles) ? raw.roles[0] : raw.role || "USER",
      avatarUrl: profile.avatarUrl || dto.avatarUrl,
      createdAt: raw.createdAt,
    });
  }
}

import { Api } from "@/shared/api";
import Cookies from "js-cookie";
import { jwtDecode, type JwtPayload } from "jwt-decode";

type RegisterPayload = {
  username: string;
  password: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string;
  role?: string;
};

type TokenData = JwtPayload & {
  scope?: string;
};

const AuthService = {
  login: async (credentials: { username: string; password: string }) => {
    // Call login API via APIGateway
    const res = await Api.post("/v1/auth/login", credentials);
    
    // Gateway success response has: status, message, errorCode, data: { token }
    if (res.data && res.data.token) {
      Cookies.set("access_token", res.data.token, { expires: 7 });
      
      // Lấy thêm thông tin user profile
      try {
        const profileInfo = await Api.get("/v1/me");
        if (profileInfo && profileInfo.data) {
          localStorage.setItem("user_info", JSON.stringify(profileInfo.data));
        }
      } catch (err) {
        console.error("Failed to fetch user profile after login", err);
      }
    }
    return res;
  },

  register: async (data: RegisterPayload) => {
    const res = await Api.post("/v1/auth/register", data);
    return res;
  },

  logout: () => {
    Cookies.remove("access_token");
    localStorage.removeItem("user_info");
  },

  /**
   * Lấy JWT mới với roles mới nhất từ DB (không cần đăng nhập lại).
   * Dùng khi admin nâng quyền user — frontend tự detect và refresh tự động.
   * @returns true nếu roles đã thay đổi (cần re-render), false nếu không đổi
   */
  refreshRoles: async (): Promise<boolean> => {
    try {
      const currentRoles = AuthService.getUserRoles().sort().join(",");
      const res = await Api.post("/v1/auth/refresh-roles", {});
      if (res?.data?.token) {
        // Cập nhật token mới vào cookie
        Cookies.set("access_token", res.data.token, { expires: 7 });
        // Lấy user info mới từ API
        try {
          const profileInfo = await Api.get("/v1/me");
          if (profileInfo?.data) {
            localStorage.setItem("user_info", JSON.stringify(profileInfo.data));
          }
        } catch {}
        // So sánh roles cũ và mới
        const newRoles = AuthService.getUserRoles().sort().join(",");
        return currentRoles !== newRoles;
      }
    } catch {}
    return false;
  },

  getCurrentUser: () => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user_info");
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  getTokenData: (): TokenData | null => {
    const token = Cookies.get("access_token");
    if (!token) return null;
    try {
      return jwtDecode<TokenData>(token);
    } catch {
      return null;
    }
  },

  getUserRoles: () => {
    const tokenData = AuthService.getTokenData();
    if (!tokenData || !tokenData.scope) return [];
    // JWT scope có dạng "ROLE_USER ROLE_HOST" — strip prefix ROLE_ để dùng nhất quán
    return tokenData.scope
      .split(" ")
      .map((r: string) => r.replace(/^ROLE_/, ""))
      .filter(Boolean);
  },

  isAuthenticated: () => {
    return !!Cookies.get("access_token");
  }
};

export default AuthService;

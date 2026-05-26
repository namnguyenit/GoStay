import { Api } from "@/shared/api";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

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

  register: async (data: { username: string; password: string; email: string; fullName: string; phoneNumber: string; dateOfBirth: string }) => {
    const res = await Api.post("/v1/auth/register", data);
    return res;
  },

  logout: () => {
    Cookies.remove("access_token");
    localStorage.removeItem("user_info");
  },

  getCurrentUser: () => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user_info");
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  getTokenData: () => {
    const token = Cookies.get("access_token");
    if (!token) return null;
    try {
      return jwtDecode(token);
    } catch (error) {
      return null;
    }
  },

  getUserRoles: () => {
    const tokenData: any = AuthService.getTokenData();
    if (!tokenData || !tokenData.scope) return [];
    return tokenData.scope.split(" ");
  },

  isAuthenticated: () => {
    return !!Cookies.get("access_token");
  }
};

export default AuthService;

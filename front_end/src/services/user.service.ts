import { Api } from "@/shared/api";

const UserService = {
  // Get current user basic account info (username, email, roles, hostProfile, enterpriseProfile)
  getMyInfo: async () => {
    return await Api.get("/v1/me");
  },

  // Update basic user profile (fullName, phoneNumber, password)
  updateMyInfo: async (data: { fullName?: string; phoneNumber?: string; password?: string }) => {
    return await Api.put("/v1/me", data);
  },

  // Get detailed profile
  getMyProfile: async () => {
    return await Api.get("/v1/me/profile");
  },

  // Update detailed profile
  updateMyProfile: async (data: { fullName?: string; phoneNumber?: string; dateOfBirth?: string }) => {
    return await Api.put("/v1/me/profile", data);
  },

  // Upload avatar
  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return await Api.post("/v1/me/avatar", formData);
  },

  // Apply to become a HOST (multipart)
  upgradeToHost: async (formData: FormData) => {
    return await Api.post("/v1/me/upgrade-host", formData);
  },

  // View submitted HOST/ENTERPRISE applications and timeline
  getUpgradeApplications: async () => {
    return await Api.get("/v1/me/upgrade-applications");
  },

  // Update a pending/rejected HOST application (multipart)
  updateUpgradeHost: async (formData: FormData) => {
    return await Api.put("/v1/me/upgrade-host", formData);
  },

  // Apply to become an ENTERPRISE
  upgradeToEnterprise: async (data: {
    companyName: string;
    companyAddress: string;
    taxCode: string;
    representativeName: string;
    bankAccount?: string;
    bankName?: string;
    bankAccountName?: string;
  }) => {
    return await Api.post("/v1/me/upgrade-enterprise", data);
  },

  // Update a pending/rejected ENTERPRISE application
  updateUpgradeEnterprise: async (data: {
    companyName: string;
    companyAddress: string;
    taxCode: string;
    representativeName: string;
    bankAccount?: string;
    bankName?: string;
    bankAccountName?: string;
  }) => {
    return await Api.put("/v1/me/upgrade-enterprise", data);
  },

  // Get host profile
  getHostProfile: async () => {
    return await Api.get("/v1/me/host-profile");
  },

  // Get enterprise profile
  getEnterpriseProfile: async () => {
    return await Api.get("/v1/me/enterprise-profile");
  },
};

export default UserService;

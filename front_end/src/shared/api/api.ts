import { env } from "@/config";

const Api = {
  get: async (endpoint: string) => {
    try {
      const res = await fetch(`${env.apiUrl}${endpoint}`, {});
      const json = await res.json();
      return json;
    } catch (error: any) {
      console.error(`GET API: ${error}`);
    }
  },
};

export default Api;

import { env } from "@/config";
import Cookies from "js-cookie";

const getToken = () => Cookies.get("access_token");

const request = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${env.apiUrl}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await res.text();
    throw new Error(`API response is not JSON. Status: ${res.status}. Body: ${text.slice(0, 150)}`);
  }

  const json = await res.json();
  if (!res.ok) {
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
  post: async (endpoint: string, body: any) => {
    try {
      return await request(endpoint, { method: "POST", body: JSON.stringify(body) });
    } catch (error: any) {
      console.error(`POST API:`, error);
      throw error;
    }
  },
  put: async (endpoint: string, body: any) => {
    try {
      return await request(endpoint, { method: "PUT", body: JSON.stringify(body) });
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
  patch: async (endpoint: string, body: any) => {
    try {
      return await request(endpoint, { method: "PATCH", body: JSON.stringify(body) });
    } catch (error: any) {
      console.error(`PATCH API:`, error);
      throw error;
    }
  },
};

export default Api;

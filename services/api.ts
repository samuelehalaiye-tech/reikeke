// services/api.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

// ⚠️ UPDATE THIS WITH YOUR MACHINE'S IP ADDRESS
// Find it with: ipconfig (Windows) or ifconfig (Mac/Linux)
// Example: const BASE_URL = "http://192.168.1.100:8000/api";
const BASE_URL = "http://10.111.187.13:8000/api";

async function getToken() {
  return await AsyncStorage.getItem("token");
}

async function authHeaders() {
  const token = await getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Token ${token}`;
  return headers;
}

async function handleResponse(res: Response) {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || data.error || "API Error");
  }
  return data;
}

export const api = {
  post: async (path: string, body: any) => {
    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        method: "POST",
        headers: await authHeaders(),
        body: JSON.stringify(body),
      });
      return handleResponse(res);
    } catch (error) {
      console.error(`POST ${path} failed:`, error);
      throw error;
    }
  },

  get: async (path: string) => {
    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        method: "GET",
        headers: await authHeaders(),
      });
      return handleResponse(res);
    } catch (error) {
      console.error(`GET ${path} failed:`, error);
      throw error;
    }
  },

  patch: async (path: string, body: any) => {
    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        method: "PATCH",
        headers: await authHeaders(),
        body: JSON.stringify(body),
      });
      return handleResponse(res);
    } catch (error) {
      console.error(`PATCH ${path} failed:`, error);
      throw error;
    }
  },

  put: async (path: string, body: any) => {
    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        method: "PUT",
        headers: await authHeaders(),
        body: JSON.stringify(body),
      });
      return handleResponse(res);
    } catch (error) {
      console.error(`PUT ${path} failed:`, error);
      throw error;
    }
  },

  delete: async (path: string) => {
    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        method: "DELETE",
        headers: await authHeaders(),
      });
      if (res.status === 204) return null;
      return handleResponse(res);
    } catch (error) {
      console.error(`DELETE ${path} failed:`, error);
      throw error;
    }
  },

  fetchRaw: async (path: string, opts: RequestInit) => {
    try {
      return fetch(`${BASE_URL}${path}`, {
        ...opts,
        headers: { ...(await authHeaders()), ...(opts.headers || {}) },
      });
    } catch (error) {
      console.error(`Custom fetch ${path} failed:`, error);
      throw error;
    }
  },
};

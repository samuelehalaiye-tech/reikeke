// services/api.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://YOUR_LOCAL_IP:8000/api"; // replace with your machine IP

async function getToken() {
  return await AsyncStorage.getItem("token");
}

async function authHeaders() {
  const token = await getToken();
  const headers: Record<string,string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Token ${token}`;
  return headers;
}

export const api = {
  post: async (path: string, body: any) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: await authHeaders(),
      body: JSON.stringify(body),
    });
    return res.json();
  },

  get: async (path: string) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: await authHeaders(),
    });
    return res.json();
  },

 
  fetchRaw: async (path: string, opts: RequestInit) => {
    return fetch(`${BASE_URL}${path}`, {
      ...opts,
      headers: { ...(await authHeaders()), ...(opts.headers || {}) },
    });
  }
};

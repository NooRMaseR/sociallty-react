import { API_URL, ACCESS, REFRESH, ApiUrls } from "./constants";
import axios, { AxiosError } from "axios";

export async function refresh_token() {
  const refresh = localStorage.getItem(REFRESH);
  if (!refresh) return false;
  try {
    const res = await api.post(ApiUrls.user_refresh_token, {
      refresh,
    });

    if (res.status == 200) {
      localStorage.setItem(ACCESS, res.data.access);
      return true;
    }
    return false;
  } catch (error) {
    return Promise.reject(error);
  }
}

let is_first = true;

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    if (error.status === 401 && is_first) {
      console.log("retry");
      try {
        is_first = false;
        await refresh_token();
        if (originalRequest && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${localStorage.getItem(ACCESS)}`;
          return api(originalRequest)
        }
      } catch (error) {
        console.error(`error here: ${error}`);
        location.href = "/login";
      }
    } else {
      is_first = true;
      return Promise.reject(error);
    }
  }
);

export default api;

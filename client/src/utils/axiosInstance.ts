import axios from "axios";

// No default Content-Type: axios sets application/json for object payloads
// and multipart/form-data (with boundary) for FormData automatically.
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

// Attach auth token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("ACCESS_TOKEN");
    if (token) {
      config.headers["x-auth-token"] = `${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Return the data object directly instead of the full error
    if (error.response) {
      return Promise.reject(error.response.data);
    }
    // For network errors or other issues without response
    return Promise.reject({ message: "Network error or server is unreachable" });
  }
);
export default axiosInstance;

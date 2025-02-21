import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL;

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request Interceptor: Attach token
axiosInstance.interceptors.request.use(
    (config) => {
        try {
            const token = localStorage.getItem("authToken");
            if (token) {
                config.headers["x-auth-token"] = `${token}`;
            }
            return config;
        } catch (error) {
            console.error("Request Interceptor Error:", error);
            return Promise.reject(error);
        }
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle errors globally
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        try {
            if (error.response) {
                if (error.response.status === 401) {
                    console.error("Unauthorized! Redirecting to login...");
                    window.location.href = "/login";  // Redirect to login if unauthorized
                }
                if (error.response.status === 500) {
                    console.error("Server Error:", error.response.data);
                }
            }
        } catch (err) {
            console.error("Response Interceptor Error:", err);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;

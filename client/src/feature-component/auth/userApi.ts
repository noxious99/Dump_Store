import axiosInstance from "@/utils/axiosInstance";
import type { LoginPayload, SignupPayload, User, ApiResponse } from "@/types/user";

export const loginApi = async (
  payload: LoginPayload
): Promise<ApiResponse<User>> => {
  try {
    const res = await axiosInstance.post<ApiResponse<User>>(
      "/v1/user/login",
      payload
    );
    return res.data;
  } catch (error: any) {
    console.error(error.response);
    return error.response.data?.msg || "Something went wrong during login"
  }
};

export const signupApi = async (
  payload: SignupPayload
): Promise<ApiResponse<User>> => {
  try {
    const res = await axiosInstance.post<ApiResponse<User>>(
      "/v1/user/register",
      payload
    );
    return res.data;
  } catch (error: any) {
    console.error(error.response);
    return error.response.data?.msg || "Something went wrong during signup"
  }
}

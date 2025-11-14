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
    return error?.msg || "Something went wrong during login"
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
    console.log("33333: ", res)
    return res.data;
  } catch (error: any) {
    return error?.msg || "Something went wrong during signup"
  }
}

import { thunk } from "redux-thunk";
import axios from "axios";

export const logAction = (userData) => async (dispatch) => {
  dispatch({ type: "LOGIN_LOADING" });
  try {
    const response = await axios.post(
      "http://localhost:8000/api/user/login",
      JSON.stringify(userData),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    const token = response.data;
    localStorage.setItem("authToken", token);
    dispatch({ type: "LOGIN_SUCCESS", payload: response.data });
  } catch (error) {
    dispatch({ type: "LOGIN_FAILED", payload: error.message });
  }
};

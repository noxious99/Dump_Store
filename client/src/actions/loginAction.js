import { thunk } from "redux-thunk";
import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL;

export const logAction = (userData) => async (dispatch) => {
  dispatch({ type: "LOGIN_LOADING" });
  try {
    const response = await axios.post(
        `${API_URL}/api/user/login`,
      JSON.stringify(userData),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    const token = response.data;
    localStorage.setItem("authToken", token);
    dispatch({ type: "LOGIN_SUCCESS", payload: response.data });
    dispatch({ type: "AUTH_SUCCESS"});
  } catch (error) {
    dispatch({ type: "LOGIN_FAILED", payload: error.message });
  }
};

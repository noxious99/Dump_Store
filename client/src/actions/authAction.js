import { thunk } from "redux-thunk";
import axios from "axios";

export const authAction = () => async (dispatch) => {
  dispatch({ type: "AUTH_LOADING" });
  try {
    const token = localStorage.getItem("authToken")
    const response = await axios.get(
      "http://localhost:8000/api/user/auth",
      {
        headers: { "x-auth-token": token },
      }
    );
    dispatch({ type: "AUTH_SUCCESS", payload: response.data });
  } catch (error) {
    dispatch({ type: "AUTH_FAILED", payload: error.message });
  }
};

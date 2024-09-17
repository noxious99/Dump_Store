import { thunk } from "redux-thunk";
import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL;

export const authAction = () => async (dispatch) => {
  dispatch({ type: "AUTH_LOADING" });
  try {
    const token = localStorage.getItem("authToken")
    const response = await axios.get(
      `${API_URL}/api/user/auth`,
      {
        headers: { "x-auth-token": token },
      }
    );
    dispatch({ type: "AUTH_SUCCESS", payload: response.data });
  } catch (error) {
    dispatch({ type: "AUTH_FAILED", payload: error.message });
  }
};

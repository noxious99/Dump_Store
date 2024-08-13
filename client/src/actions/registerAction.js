import { thunk } from "redux-thunk";
import axios from "axios";

export const regAction = (userData) => async (dispatch) => {
  dispatch({ type: "REGISTER_LOADING" });
  try {
    const response = await axios.post(
      "http://localhost:8000/api/user/register",
      JSON.stringify(userData),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    const token = response.data;
    localStorage.setItem("authToken", token);
    dispatch({ type: "REGISTER_SUCCESS", payload: response.data });
  } catch (error) {
    dispatch({ type: "REGISTER_FAILED", payload: error.message });
  }
};

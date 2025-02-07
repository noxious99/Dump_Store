import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL;

export const regAction = (userData) => async (dispatch) => {
  dispatch({ type: "REGISTER_LOADING" });
  try {
    const response = await axios.post(
      `${API_URL}/api/user/register`,
      JSON.stringify(userData),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    const token = response.data;
    localStorage.setItem("authToken", token);
    dispatch({ type: "REGISTER_SUCCESS", payload: response.data });
    dispatch({ type: "AUTH_SUCCESS"});
  } catch (error) {
    dispatch({ type: "REGISTER_FAILED", payload: error.response.data.err });
  }
};

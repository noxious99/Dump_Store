import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL;

export const userUpdate = (id, userData) => async (dispatch) => {
  dispatch({ type: "UPDATE_LOADING" });
  try {
    const response = await axios.put(
      `${API_URL}/api/user/update/${id}`,
      userData,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    dispatch({ type: "UPADTE_SUCCESS", payload: response.data });
  } catch (error) {
    dispatch({ type: "UPADTE_FAILED", payload: error.message });
  }
};

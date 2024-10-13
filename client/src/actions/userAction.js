import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL;

export const userUpdate = (id, userData) => async (dispatch) => {
  dispatch({ type: "UPDATE_LOADING" });
  try {
    const response = await axios.put(
      `${API_URL}/api/user/update/${id}`,
      userData, // This will now be FormData
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    dispatch({ type: "UPDATE_SUCCESS", payload: response.data });
  } catch (error) {
    dispatch({ type: "UPDATE_FAILED", payload: error.message });
  }
};

const initialState = {
  isLoading: false,
  userInfo: null,
  token: null,
  isAuthenticated: false,
};

export const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case "AUTH_LOADING":
      return {
        ...state,
        isLoading: true,
      };
    case "AUTH_SUCCESS":
      return {
        isLoading: false,
        isAuthenticated: true,
        userInfo: action.payload,
      };
    case "AUTH_FAILED":
      return {
        isLoading: false,
        isAuthenticated: false,
        token: null,
        userInfo: null,
      };
    case "UPDATE_LOADING":
      return {
        isLoading: false,
        ...state,
      };
    case "UPDATE_SUCCESS":
      return {
        isLoading: false,
        isAuthenticated: true,
        userInfo: {
          ...state.userInfo, // Keep existing fields (e.g., _id, avatar, etc.)
          ...action.payload, // Overwrite only the updated fields (e.g., username, email)
        },
      };
    case "LOG_OUT":
      localStorage.removeItem("authToken");
      return {
        isLoading: false,
        isAuthenticated: false,
        token: null,
        userInfo: null,
      };
    default:
      return state;
  }
};

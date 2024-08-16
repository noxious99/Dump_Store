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
        userInfo: null
      };
    case "LOG_OUT":
      localStorage.removeItem("authToken");
      return {
        isLoading: false,
        isAuthenticated: false,
        token: null,
        userInfo: null
      };
    default:
      return state;
  }
};

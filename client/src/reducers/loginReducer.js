const initialState = {
    isLoading: false,
    token: "",
    error: "",
  };
  
  export const logReducer = (state = initialState, action) => {
    switch (action.type) {
      case "LOGIN_LOADING":
        return {
          ...state,
          isLoading: true,
        };
      case "LOGIN_SUCCESS":
        return {
          isLoading: false,
          token: action.payload,
          error: "",
        };
      case "LOGIN_FAILED":
        return {
          isLoading: false,
          token: action.payload,
          error: action.payload,
        };
  
      default:
        return state;
    }
  };
  
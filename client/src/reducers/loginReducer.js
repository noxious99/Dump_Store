const initialState = {
    isLoading: false,
    token: "",
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
        };
      case "LOGIN_FAILED":
        return {
          isLoading: false,
          token: action.payload,
        };
  
      default:
        return state;
    }
  };
  
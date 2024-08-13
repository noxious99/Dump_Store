const initialState = {
    isLoading: false,
    userInfo:""
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
          userInfo: action.payload,
        };
      case "LOGIN_FAILED":
        return {
          isLoading: false,
          userInfo: action.payload,
        };
  
      default:
        return state;
    }
  };
  
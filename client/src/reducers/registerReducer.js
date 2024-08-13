const initialState = {
  isLoading: false,
  token: "",
};

export const regReducer = (state = initialState, action) => {
  switch (action.type) {
    case "REGISTER_LOADING":
      return {
        ...state,
        isLoading: true,
      };
    case "REGISTER_SUCCESS":
      return {
        isLoading: false,
        token: action.payload,
      };
    case "REGISTER_FAILED":
      return {
        isLoading: false,
        token: action.payload,
      };

    default:
      return state;
  }
};

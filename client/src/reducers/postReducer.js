
const initialState = {
  isLoading: false,
  postStatus: null,
  success: false,
  error: false
};

export const postReducer = (state = initialState, action) => {
  switch (action.type) {
    case "POST_LOADING":
      return {
        ...state,
        isLoading: true,
        success: false,
        error: false
      };
    case "POST_SUCCESS":
      return {
        isLoading: false,
        postStatus: action.payload,
        success: true,
        error: false
      };
    case "POST_FAILED":
      return {
        isLoading: false,
        postStatus: action.payload,
        success: false,
        error: true
      };
    default:
      return state;
  }
};

const allPostInitialState = {
  isLoading: false,
  allPost: null,
  voteLoading: false,
  deleteLoading: false,
  totalCount: 0
};

export const getPostReducer = (state = allPostInitialState, action) => {
  switch (action.type) {
    case "GET_POST_LOADING":
      return {
        ...state,
        isLoading: true,
      };
    case "GET_POST_SUCCESS":
      return {
        isLoading: false,
        allPost: action.payload.posts,
        totalCount: action.payload.totalPosts
      };
    case "GET_POST_FAILED":
      return {
        isLoading: false,
        allPost: action.payload,
        totalCount: 0
      };
    case "UPVOTE_LOADING":
      return {
        ...state,
        voteLoading: true,
      };
    case "UPVOTE_SUCCESS":
      return {
        isLoading: false,
        allPost: state.allPost.map((post) =>
          post._id === action.payload._id ? action.payload : post
        ),
        totalCount: state.totalCount,
      };
    case "DOWNVOTE_LOADING":
      return {
        ...state,
        voteLoading: true,
      };
    case "DOWNVOTE_SUCCESS":
      return {
        voteLoading: false,
        allPost: state.allPost.map((post) =>
          post._id === action.payload._id ? action.payload : post
        ),
        totalCount: state.totalCount,
      };
    case "DELETE_LOADING":
      return {
        ...state,
        deleteLoading: true,
      };
    case "DELETE_SUCCESS":
      return {
        deleteLoading: false,
        allPost: state.allPost.filter((post) => 
          post._id !== action.payload._id),
        totalCount: state.totalCount,
      };
    case "DELETE_FAILED":
      return {
        deleteLoading: false
      }
    default:
      return state;
  }
};

const voteState = {
  isLoading: false,
};

export const voteReducer = (state = voteState, action) => {
  switch (action.type) {
    case "UPVOTE_FAILED":
      return {
        isLoading: false,
      };
    case "DOWNVOTE_FAILED":
      return {
        isLoading: false,
      };
    default:
      return state;
  }
};

const allPagePostInitialState ={
  isLoading: false,
  PagePosts: null
}
export const allPostReducer = (state = allPagePostInitialState , action) => {
  switch (action.type) {
    case "GET_ALL_POST_LOADING":
      return {
        ...state,
        isLoading: true
      };
    case "GET_ALL_POST_SUCCESS":
      return {
        isLoading: false,
        PagePosts: action.payload
      };
    default:
      return state;
  }
};

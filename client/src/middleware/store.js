import { createStore, applyMiddleware, combineReducers } from "redux";
import {thunk} from "redux-thunk";
import { composeWithDevTools } from "@redux-devtools/extension";
import { regReducer } from "../reducers/registerReducer";
import { logReducer } from "../reducers/loginReducer";
import { authReducer } from "../reducers/authReducer";
import { getPostReducer, postReducer, voteReducer } from "../reducers/postReducer";



const middleware = [thunk];
const rootReducer = combineReducers({
  register: regReducer,
  login: logReducer,
  auth: authReducer,
  post: postReducer,
  getPost: getPostReducer,
  vote: voteReducer
});
const store = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(...middleware))
);

export default store;

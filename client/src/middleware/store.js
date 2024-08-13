import { createStore, applyMiddleware, combineReducers } from "redux";
import {thunk} from "redux-thunk";
import { composeWithDevTools } from "@redux-devtools/extension";
import { regReducer } from "../reducers/registerReducer";
import { logReducer } from "../reducers/loginReducer";
import { authReducer } from "../reducers/authReducer";

const middleware = [thunk];
const rootReducer = combineReducers({
  register: regReducer,
  login: logReducer,
  auth: authReducer
});
const store = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(...middleware))
);

export default store;

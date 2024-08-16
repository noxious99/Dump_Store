import { thunk } from "redux-thunk";
import axios from "axios";

export const logoutAction = () => {
  return {
    type: "LOG_OUT",
  };
};

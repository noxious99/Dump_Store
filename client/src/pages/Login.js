import React from "react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logAction } from "../actions/loginAction";
import { Link, Navigate, useNavigate } from "react-router-dom";
import "../styles/logStyle.css";
import { authAction } from "../actions/authAction";
import { FaUserShield } from "react-icons/fa6";
import { RiLockPasswordFill } from "react-icons/ri";

export const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.login);
  const authenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    dispatch(authAction());
    if (authenticated) {
      navigate("/Profile");
    }
    console.log(authenticated);
  }, [authenticated, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = {
      username: username,
      password: password,
    };
    dispatch(logAction(user));
    console.log(user);
  };

  return (
    <div className="flex justify-center items-center my-10">
      <div className="flex flex-col items-center text-white">
        <div className="text-2xl">
          <p>Log In</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 items-center bg-[#1D1D1D] 
        px-4 py-6 rounded min-w-[300px] lg:min-w-[450px] my-5">
          <div className="flex flex-col items-center">
          <div className="flex flex-row gap-2 self-start items-center">
              <p><FaUserShield className="text-xl p-0 m-0"/></p><label className="text-md">Username or Email:</label>
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username or email"
              className="bg-black text-white border-0 px-4 py-2 min-w-[290px] lg:min-w-[400px] rounded"
            />
          </div>
          <div className="flex flex-col items-center">
            <div className="flex flex-row gap-2 self-start items-center">
              <p><RiLockPasswordFill className="text-xl p-0 m-0"/></p><label className="text-md">Password:</label>
            </div>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="bg-black text-white border-0 px-4 py-2 min-w-[290px] lg:min-w-[400px] rounded"
            />
          </div>
          <button type="submit" disabled={isLoading} className="bg-green-950 py-2 border-0 rounded w-full lg:w-[96%] 
                                                  text-white mt-2 mx-4 text-md hover:bg-green-900">
            {isLoading ? "Logging in..." : "LOGIN"}
          </button>
        </form>
        <div style={{ textDecoration: "none" }}>
          Not a member yet?
          <Link
            to="/Register"
            style={{
              color: "darkGreen",
              marginLeft: "5px",
            }}
            className="underline underline-offset-3"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

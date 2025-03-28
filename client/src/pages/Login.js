import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logAction } from "../actions/loginAction";
import { Link, useNavigate } from "react-router-dom";
import { authAction } from "../actions/authAction";
import "../styles/logStyle.css";
import { FaUserShield } from "react-icons/fa6";
import { RiLockPasswordFill } from "react-icons/ri";
import { MdError } from "react-icons/md";

export const Login = () => {
  const [userLogBody, setUserLogBody] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false)

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isLoading, error: loginError } = useSelector((state) => state.login);
  const authenticated = useSelector((state) => state.auth.isAuthenticated);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userLogBody === "") {
      return setError("Please enter your username or email");
    }
    if (password === "") {
      return setError("Please enter your password");
    }
    const user = { logBody: userLogBody, password: password };
    dispatch(logAction(user));
    setError("");
  };

  useEffect(() => {
    dispatch(authAction());
    if (authenticated) {
      navigate("/collection");
    }
  }, [authenticated, navigate, loginError]);


  return (
    <div className="flex justify-center items-center my-10 lg:my-[70px]">
      <div className="flex flex-col items-center text-white lg:bg-black lg:py-8 lg:rounded-md">
        {loginError ? (
          <div style={{border: '1px solid red'}} className="text-red-600 text-lg text-center bg-[#1d1d1d] py-2 lg:mx-5 w-full lg:max-w-[calc(100%-60px)] rounded mb-2">{loginError}</div>
        ) : null}
        <div className="flex items-center gap-2 text-2xl">
          {error || loginError ? <MdError className="text-red-600 text-[40px]" /> : null} 
          <p>Log In</p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 items-center bg-[#1D1D1D] px-4 py-6 rounded lg:rounded-none min-w-[300px] lg:min-w-[450px] my-5"
        >
          <div className="flex flex-col items-center">
            <div className="flex flex-row gap-2 self-start items-center">
              <p>
                <FaUserShield className="text-xl p-0 m-0" />
              </p>
              <label className="text-md">Username or Email:</label>
            </div>
            <input
              type="text"
              value={userLogBody}
              onChange={(e) => setUserLogBody(e.target.value)}
              placeholder="Enter your username or email"
              className="bg-black text-white border-0 px-4 py-3 min-w-[290px] lg:min-w-[400px] rounded"
            />
            {error && error.includes("email") ? <div className="text-red-600 text-sm text-center mt-1">{error}</div> : null}
          </div>
          <div className="flex flex-col items-center">
            <div className="flex flex-row gap-2 self-start items-center">
              <p>
                <RiLockPasswordFill className="text-xl p-0 m-0" />
              </p>
              <label className="text-md">Password:</label>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="bg-black text-white border-0 px-4 py-3 min-w-[290px] lg:min-w-[400px] rounded"
            />
            <div className="flex gap-2 items-center self-start mt-2 ml-2"><input type="checkbox" id="checkbox" class="checkbox" onChange={() => setShowPassword(!showPassword)} />
              <span className="text-sm">show password</span>
            </div>
            {error && error.includes("password") ? <div className="text-red-600 text-sm text-center">{error}</div> : null}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-green-950 py-3 border-0 rounded w-full lg:w-[96%] text-white mt-2 mx-4 text-md lg:text-lg hover:bg-green-900"
          >
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

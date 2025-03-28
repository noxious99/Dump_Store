import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { regAction } from "../actions/registerAction";
import { Link, useNavigate } from "react-router-dom";
import "../styles/regStyle.css";
import { authAction } from "../actions/authAction";
import { FaUserShield } from "react-icons/fa6";
import { RiLockPasswordFill } from "react-icons/ri";
import { MdEmail } from "react-icons/md";
import { MdOutlinePassword } from "react-icons/md";
import { MdError } from "react-icons/md";

export const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState({});
  const [showPassword, setShowPassword] = useState(false)

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading, error: regError } = useSelector((state) => state.register);
  const authenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    dispatch(authAction());
    if (authenticated) {
      navigate("/collection");
    }
  }, [authenticated, navigate, regError]);

  const handleSubmit = (e) => {
    e.preventDefault();
    let newErrors = {};

    if (username === "") {
      newErrors.usernameError = "Please enter your username";
    }
    if (email === "") {
      newErrors.emailError = "Please enter your email";
    }
    if (password === "") {
      newErrors.passwordError = "Please enter your password";
    }
    if (password.length < 8 && password !== "") {
      newErrors.passwordError = "Password must be at least 8 characters long";
    }
    if (password !== confirmPassword || confirmPassword === "") {
      newErrors.passwordNotMatchedError = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      return setError(newErrors);
    }
    setError({});
    const user = {
      username: username,
      email: email,
      password: password,
    };
    dispatch(regAction(user));
  };
  return (
    <div className="flex justify-center items-center my-10 lg:my-[70px]">
      <div className="flex flex-col items-center text-white lg:bg-black lg:py-8 lg:rounded-md">
        <div className="flex items-center gap-2 text-2xl">
          {Object.keys(error).length > 0 || regError ? <MdError className="text-red-600 text-[40px]" /> : null} 
          <p>Register</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 items-center bg-[#1D1D1D] 
        px-4 py-6 rounded lg:rounded-none min-w-[300px] lg:min-w-[450px] my-5">
          <div className="flex flex-col items-center">
            <div className="flex flex-row gap-2 self-start items-center">
              <p><FaUserShield className="text-xl p-0 m-0" /></p><label className="text-md">Username:</label>
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="bg-black text-white border-0 px-4 py-3 min-w-[290px] lg:min-w-[400px] rounded"
            />
            {error.usernameError ? <div className="text-red-600 text-sm text-center">{error.usernameError}</div> : null}
            {regError && regError.includes("username") ? <div className="text-red-600 text-sm text-center">{regError}</div> : null}
          </div>
          <div className="flex flex-col items-center">
            <div className="flex flex-row gap-2 self-start items-center">
              <p><MdEmail className="text-xl p-0 m-0" /></p><label className="text-md">Email:</label>
            </div>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your Email"
              className="bg-black text-white border-0 px-4 py-3 min-w-[290px] lg:min-w-[400px] rounded"
            />
            {error.emailError ? <div className="text-red-600 text-sm text-center">{error.emailError}</div> : null}
            {regError && regError.includes("email") ? <div className="text-red-600 text-sm text-center">{regError}</div> : null}
          </div>
          <div className="flex flex-col items-center">
            <div className="flex flex-row gap-2 self-start items-center">
              <p><RiLockPasswordFill className="text-xl p-0 m-0" /></p><label className="text-md">Password:</label>
            </div>
            <input
              type={showPassword? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="bg-black text-white border-0 px-4 py-3 min-w-[290px] lg:min-w-[400px] rounded"
            />
            {error.passwordError ? <div className="text-red-600 text-sm text-center">{error.passwordError}</div> : null}
          </div>
          <div className="flex gap-2 items-center mt-2 self-start ml-2 md:ml-4"><input type="checkbox" id="checkbox" class="checkbox" onChange={() => setShowPassword(!showPassword)} />
            <span className="text-sm">show password</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex flex-row gap-2 self-start items-center">
              <p><MdOutlinePassword className="text-xl p-0 m-0" /></p><label className="text-md">Confirm Password:</label>
            </div>
            <input
              type={showPassword? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="bg-black text-white border-0 px-4 py-3 min-w-[290px] lg:min-w-[400px] rounded"
            />
            {error.confirmPasswordError ? <div className="text-red-600 text-sm text-center">{error.confirmPasswordError}</div> : null}
            {error.passwordNotMatchedError ? <div className="text-red-600 text-sm text-center">{error.passwordNotMatchedError}</div> : null}
          </div>
          <button type="submit" disabled={isLoading} className="bg-green-950 py-3 border-0 rounded w-full lg:w-[96%] 
                                                  text-white mt-2 mx-4 text-md lg:text-lg hover:bg-green-900">
            {isLoading ? "Creating..." : "REGISTER"}
          </button>
        </form>
        <div style={{ textDecoration: "none" }}>
          Already have an account?
          <Link
            to="/Login"
            style={{
              color: "darkGreen",
              marginLeft: "5px",
            }}
            className="underline underline-offset-3"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

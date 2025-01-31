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

export const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading } = useSelector((state) => state.register);
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
      email: email,
      password: password,
    };
    dispatch(regAction(user));
    console.log(user);
  };
  return (
    <div className="flex justify-center items-center my-10 lg:my-[70px]">
      <div className="flex flex-col items-center text-white lg:bg-black lg:py-8 lg:rounded-md">
        <div className="text-2xl">
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
          </div>
          <div className="flex flex-col items-center">
            <div className="flex flex-row gap-2 self-start items-center">
              <p><RiLockPasswordFill className="text-xl p-0 m-0" /></p><label className="text-md">Password:</label>
            </div>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="bg-black text-white border-0 px-4 py-3 min-w-[290px] lg:min-w-[400px] rounded"
            />
          </div>
          <div className="flex flex-col items-center">
            <div className="flex flex-row gap-2 self-start items-center">
              <p><MdOutlinePassword className="text-xl p-0 m-0" /></p><label className="text-md">Confirm Password:</label>
            </div>
            <input
              type="text"
              value={password}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="bg-black text-white border-0 px-4 py-3 min-w-[290px] lg:min-w-[400px] rounded"
            />
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

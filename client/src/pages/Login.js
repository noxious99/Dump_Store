import React from "react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logAction } from "../actions/loginAction";
import { Link, Navigate, useNavigate } from "react-router-dom";
import "../styles/logStyle.css";
import { authAction } from "../actions/authAction";

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
    <div className="container">
      <div className="logContainer">
        <div className="Title">
          <p>Log In</p>
        </div>
        <form onSubmit={handleSubmit}>
          <label>User Name:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label>Password:</label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Logging in..." : "LOGIN"}
          </button>
        </form>
        <Link to="/">BACK TO HOME</Link>
      </div>
    </div>
  );
};

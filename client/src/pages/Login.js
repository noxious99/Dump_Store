import React from "react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { logAction } from "../actions/loginAction";
import { Link } from 'react-router-dom'

export const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();

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
    <div className="loginContainer">
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

        <button>Login</button>
      </form>
      <Link to="/">BACK TO HOME</Link>
    </div>
  );
};

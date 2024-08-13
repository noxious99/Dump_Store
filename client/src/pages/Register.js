import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { regAction } from "../actions/registerAction";
import { Link } from 'react-router-dom'

export const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");


  const dispatch = useDispatch();

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
    <div className="registerContainer">
      <form onSubmit={handleSubmit}>
        <label>User Name:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <label>Email:</label>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label>Password:</label>
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <label>Confirm Password:</label>
        <input
          type="text"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button>Register</button>
      </form>
      <Link to="/">BACK TO HOME</Link>
    </div>
  );
};

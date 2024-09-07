import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { regAction } from "../actions/registerAction";
import { Link, useNavigate } from "react-router-dom";
import "../styles/regStyle.css";
import { authAction } from "../actions/authAction";

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
    <div className="container">
      <div className="registerContainer">
        <div className="Title">
          <p>Register</p>
        </div>
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
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "REGISTER"}
          </button>
        </form>
        <div style={{ textDecoration: "none" }}>
          Already have an account?
          <Link
            to="/Login"
            style={{
              textDecoration: "none",
              color: "darkGreen",
              marginLeft: "5px",
            }}
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

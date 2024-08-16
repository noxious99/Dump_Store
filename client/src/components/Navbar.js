import React from "react";
import { Link } from "react-router-dom";
import "../styles/navbarStyle.css";
import { useDispatch, useSelector } from "react-redux";
import { logoutAction } from "../actions/logoutAction";

export const Navbar = () => {
  const dispatch = useDispatch();
  const authenticated = useSelector((state) => state.auth.isAuthenticated);

  const handleLogout = () => {
    dispatch(logoutAction());
  };

  return (
    <div className="NavbarContainer">
      <div className="navLeft">
        <div id="logo">
          <p>
            <Link to="/">logo</Link>
          </p>
        </div>
      </div>
      <div className="navRight">
        {!authenticated ? (
          <>
            <div id="links">
              <Link to="/Register">Register</Link>
            </div>
            <div id="links">
              <Link to="/Login">Login</Link>
            </div>
          </>
        ) : (
          <>
            <div id="links">
              <Link to="/Profile">Profile</Link>
            </div>
            <div id="links">
              <button onClick={handleLogout}>
                <Link to="/">LogOut</Link>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

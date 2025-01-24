import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "../styles/navbarStyle.css";
import { useDispatch, useSelector } from "react-redux";
import { logoutAction } from "../actions/logoutAction";
import down from "../resources/imagesNicons/down.png";
import icon from "../resources/imagesNicons/icon-01.png";

import SearchBar from "./SearchBar";

export const Navbar = () => {
  const dispatch = useDispatch();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const authenticated = useSelector((state) => state.auth.isAuthenticated);
  const { avatar, username } = useSelector(
    (state) => state.auth.userInfo || {}
  );
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    dispatch(logoutAction());
  };

  useEffect(() => {
    if (avatar) {
      setLoading(false);
    }
  }, [avatar]);

  return (
    <div className="box-border shadow-xl shadow-(0, 0, 0, 0.4) flex items-center justify-between md:justify-between gap-3 py-2">
      <div >
        <Link to="/">
          <img src={icon} className="w-[50px] h-[auto] ml-2 lg:ml-5"/>
        </Link>
      </div>

      <SearchBar />

      <div className="navRight mr-3 lg:mr-5">
        {!authenticated ? (
          <div style={{ textDecoration: "none" }} >
            <Link to="/Login" className="text-white bg-black px-4 py-3 rounded text-md">Login</Link>
          </div>
        ) : (
          <>
            <div id="links" className="profile-container">
              <div className="profile-menu" onClick={toggleDropdown}>
                <div className="profileOptions">
                  <img src={avatar} alt="Profile Icon" />
                  <img src={down} alt="Dropdown Icon" id="downIcon" />
                </div>
                {isDropdownOpen && (
                  <ul className="dropdown">
                    {username && (
                      <li>
                        <p>Welcome!! {username}</p>
                      </li>
                    )}
                    <li>
                      <Link to="/profile">Profile</Link>
                    </li>
                    <li>
                      <Link to="/collection">Collections</Link>
                    </li>
                    <li>
                      <a href="#" onClick={handleLogout}>
                        Logout
                      </a>
                    </li>
                  </ul>
                )}
              </div>
            </div>
            <div id="links"></div>
          </>
        )}
      </div>
    </div>
  );
};

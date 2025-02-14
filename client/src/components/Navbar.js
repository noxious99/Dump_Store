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
    <div className="box-border shadow-xl bg-[#1D1D1D] flex items-center justify-between md:justify-between gap-3 py-2">
        
        <Link to="/">
          <img src={icon} className="w-[auto] h-[44px] lg:h-[58px] mb-[-8px] ml-2 lg:ml-5 lg:mr-5"/>
        </Link>

      <SearchBar/>

      <div className="navRight mr-2 lg:mr-5">
        {!authenticated ? (
          <div style={{ textDecoration: "none" }} >
            <Link to="/Login" className="text-white bg-black px-4 lg:px-5 py-[9px] lg:py-[16px] rounded text-md">Login</Link>
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

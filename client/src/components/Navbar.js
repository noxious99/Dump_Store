import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/navbarStyle.css";
import { useDispatch, useSelector } from "react-redux";
import { logoutAction } from "../actions/logoutAction";
import down from "../resources/imagesNicons/down.png";
import icon from "../resources/imagesNicons/icon-01.png";

export const Navbar = () => {
  const dispatch = useDispatch();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const authenticated = useSelector((state) => state.auth.isAuthenticated);
  const { avatar, username } = useSelector((state) => state.auth.userInfo || {});
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    dispatch(logoutAction());
  };

  useEffect(() => {
    if (avatar) {
      setLoading(false);
    }
  }, [avatar]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="navShadow">
    <div className="NavbarContainer">
      <div className="navLeft">
        <div id="iconNav">
            <Link to="/"><img src={icon}/></Link>
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
            <div id="links">
            </div>
          </>
        )}
      </div>
    </div>
    </div>
  );
};

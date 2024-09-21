import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/navbarStyle.css";
import { useDispatch, useSelector } from "react-redux";
import { logoutAction } from "../actions/logoutAction";
import down from "../resources/imagesNicons/down.png";
import icon from "../resources/imagesNicons/icon-01.png";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL;

export const Navbar = () => {
  const dispatch = useDispatch();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const authenticated = useSelector((state) => state.auth.isAuthenticated);
  const { avatar, username } = useSelector(
    (state) => state.auth.userInfo || {}
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

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

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchTerm(query);

    if (query.length > 0) {
      try {
        const response = await axios.get(
          `${API_URL}/api/user/search?buddy=${query}`
        );
        setSearchResults(response.data);
      } catch (error) {
        console.error("Error fetching search results", error);
      }
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div className="navShadow">
      <div className="NavbarContainer">
        <div className="navLeft">
          <div id="iconNav">
            <Link to="/">
              <img src={icon} />
            </Link>
          </div>
        </div>
        <div className="navMiddle">
          <div id="searchBar">
            <input
              type="text"
              placeholder="Search Buddies"
              value={searchTerm}
              onChange={handleSearch} // Update search term on change
            />
            <button type="submit" onClick={(e) => e.preventDefault()}>
              <PersonSearchIcon sx={{ fontSize: 35 }} />
            </button>
            {searchResults.length > 0 && (
              <ul className="search-dropdown">
                {searchResults.map((buddy) => (
                  <li key={buddy._id}>
                    <Link to={`/Buddies/${buddy.username}`}>
                      <img
                        src={buddy.avatar}
                        style={{ height: "20px", margin: "0px 10px 0px 10px" }}
                      />
                      {buddy.username}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
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
              <div id="links"></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";

const API_URL = process.env.REACT_APP_API_URL;

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const searchDropdownRef = useRef(null); // Reference for the search dropdown

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

  // Close the search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(event.target)
      ) {
        setSearchResults([]); // Close the search results
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className="navMiddle">
        <div id="searchBar" ref={searchDropdownRef}>
          <input
            type="text"
            placeholder="Search Buddies"
            value={searchTerm}
            onChange={handleSearch}
          />
          <button type="submit">
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
    </>
  );
};

export default SearchBar;

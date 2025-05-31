import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { MdOutlinePersonSearch } from "react-icons/md";

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
      <div>
        <div ref={searchDropdownRef} className="flex flex-row items-center w-full">
          <input
            type="text"
            placeholder="Search Buddies"
            value={searchTerm}
            onChange={handleSearch}
            className="flex-grow h-[24px] w-[112px] lg:h-[28px] md:w-[300px] bg-dark border-0 py-2 px-4
             text-white rounded-l-md max-w-[600px] text-md focus:ring-2 focus:ring-[#7e2020] focus:outline-none"
          />
          <button
            type="submit"
            className="bg-[#7e2020] border-0 flex justify-center items-center h-[40px] lg:h-[44px] px-2 rounded-tr-2xl rounded-br-md"
          >
            <MdOutlinePersonSearch className="text-2xl lg:text-4xl" />
          </button>
          {searchResults.length > 0 && (
            <ul className="search-dropdown">
              {searchResults.map((buddy) => (
                <li key={buddy._id}>
                  <Link to={`/Buddies/${buddy.username}`}>
                    <img
                      src={buddy.avatar}
                      style={{ height: "20px", margin: "0px 10px 0px 10px" }}
                      alt={`${buddy.username}'s avatar`}
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

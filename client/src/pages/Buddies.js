import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import SendTimeExtensionIcon from '@mui/icons-material/SendTimeExtension';
import { useParams } from "react-router-dom";
const API_URL = process.env.REACT_APP_API_URL;

export const Buddies = () => {
  const { username } = useParams();
  const [searchResults, setSearchResults] = useState([]);
  const [buddy, setBuddy] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/user/allusers`);
        setSearchResults(response.data);

        const foundBuddy = Array.isArray(response.data)
          ? response.data.find((user) => user.username === username)
          : null;

        setBuddy(foundBuddy);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [username]);

  // Function to calculate how many months a user has been active
  const calculateMonthsActive = (creationDate) => {
    const now = moment();
    const createdAt = moment(creationDate);
    return now.diff(createdAt, 'months'); // Difference in months
  };

  return (
    <div>
      {buddy ? (
        <>
          <div className="basicInfo" style={{maxWidth: "400px"}}>
            <div className="userInfo" >
              <div className="profilePic">
                <img src={buddy.avatar} alt={`${buddy.username}'s avatar`} />
              </div>
              <div>
                <h3 style={{ color: "wheat", marginBottom: "10px" }}>
                  User: {buddy.username}
                </h3>
              </div>
            </div>
            <div>
              <h3 style={{ textDecoration: "underline" }}>
                Active Since: ({calculateMonthsActive(buddy.date)} months)
              </h3>
            </div>
          </div>
          <div className="basicInfo" style={{color: "lightBlue",height: "40px", width: "150px", display: "flex", textAlign: "center", alignItems: "center"}}>
            <p> Send Message: </p> <div><SendTimeExtensionIcon sx={{fontSize: 30}}/></div>
          </div>
        </>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

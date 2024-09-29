import React from "react";
import "../styles/profileStyle.css"; // Create a separate CSS file for styles

export const Info = ({
  email,
  totalPosts,
  userDate,
  buddiesCount,
  currentGoal,
}) => {
  return (
    <div className="infoContainer">
      <h3>User Information</h3>
      <div className="infoItem">
        <strong>Email: </strong> <span>{email}</span>
      </div>
      <div className="infoItem">
        <strong>Total Posts: </strong> <span>{totalPosts}</span>
      </div>
      <div className="infoItem">
        <strong>Account Created: </strong>{" "}
        <span style={{ marginLeft: "10px" }}>{userDate}</span>
      </div>
      <div className="infoItem">
        <strong>Buddies Count: </strong> <span>{buddiesCount}</span>
      </div>
      <div className="infoItem">
        <strong>Current Goal: </strong> <span>{currentGoal}</span>
      </div>
    </div>
  );
};

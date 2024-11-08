import React from "react";
import GoalIcon from "../resources/imagesNicons/goal-icon.png";
import { Link } from "react-router-dom";

export const GoalComponent = ({ goal }) => {
  return (
    <div className="goalComponent">
      <div>
        <img src={GoalIcon} alt="Goal Icon" />
      </div>
      <div>
        <Link to={`/GoalDetails/${goal._id}`}>
          <p style={{ color: "#555", fontSize: "1.2em" }}>{goal.title}</p>
        </Link>
      </div>
    </div>
  );
};

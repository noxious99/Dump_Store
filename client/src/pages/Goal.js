import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { GoalComponent } from "../components/GoalComponent";
import "../styles/goalStyle.css";

export const Goal = () => {
  const [goals, setGoals] = useState([]);
  const [title, setTitle] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const handleShowAdd = () => {
    setShowAdd(!showAdd);
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();

    const newGoal = {
      title,
    };
    try {
      const token = localStorage.getItem("authToken");
      await axios.post("http://localhost:8000/api/goal/", newGoal, {
        headers: {
          "x-auth-token": token,
        },
      });
      setTitle(""); // Clear input after adding goal
    } catch (error) {
      console.error("Failed to post goal", error);
    }
  };

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await axios.get("http://localhost:8000/api/goal/", {
          headers: {
            "x-auth-token": token,
          },
        });
        setGoals(res.data);
      } catch (error) {
        console.error("Failed to fetch goals:", error);
      }
    };

    fetchGoals();
  }, []);

  return (
    <div>
      <div className="GoalConatiner">
        <div className="GoalHeadline">
          <div className="goalStats">
            <div className="statItem">
              Total Set Goal: <span className="circle">{goals.length}</span>
            </div>
            <div className="statItem">
              Finished Goal:{" "}
              <span className="circle">
                {goals.filter((goal) => goal.isFulfilled).length}
              </span>
            </div>
          </div>
          {!showAdd && (
            <div id="item">
              <button className="btn" onClick={handleShowAdd}>
                Add New One
              </button>
            </div>
          )}
          {showAdd && (
            <div>
              <form onSubmit={handleAddGoal} className="goalForm">
                <input
                  type="text"
                  value={title}
                  className="goalInput"
                  id="goalTitleInput"
                  placeholder="What's Your Target?"
                  onChange={(e) => setTitle(e.target.value)}
                />
                <button
                  type="submit"
                  className="btn goalSubmitBtn"
                  id="addGoalBtn"
                >
                  Add New One
                </button>
              </form>
            </div>
          )}
        </div>
        <div className="goalComponentContainer">
          {goals.map((goal) => (
            <GoalComponent key={goal._id} goal={goal} />
          ))}
        </div>
      </div>
    </div>
  );
};

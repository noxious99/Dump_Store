import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/goalStyle.css";

export const GoalDetails = () => {
  const [goal, setGoal] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const { id } = useParams();

  const handleShowAdd = () => {
    setShowAdd(!showAdd);
  };

  const handleAddObjective = async (e) => {
    e.preventDefault();
    const newObj = {
      title,
    };
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.post(
        `http://localhost:8000/api/goal/${id}`,
        newObj,
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );
      console.log(res.data);
      setTitle("");
      const fetchedGoal = Array.isArray(res.data)
        ? res.data.find((goal) => goal._id === id)
        : res.data;

      setGoal(fetchedGoal);
      setShowAdd(false); // Hide the form after adding an objective
    } catch (error) {
      console.error("Failed to post objective", error);
    }
  };

  useEffect(() => {
    const fetchGoal = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await axios.get(`http://localhost:8000/api/goal/${id}`, {
          headers: {
            "x-auth-token": token,
          },
        });
        console.log(res.data);

        const fetchedGoal = Array.isArray(res.data)
          ? res.data.find((goal) => goal._id === id)
          : res.data;

        setGoal(fetchedGoal);
      } catch (error) {
        console.error("Failed to fetch goal:", error);
      }
    };

    fetchGoal();
  }, [id]);

  if (!goal) {
    return <div>Loading...</div>;
  }

  return (
    <div className="goalDetailsContainer">
      <h2 className="goalTitle">{goal.title}</h2>
      <p className="goalCreatedAt">
        Created on: {new Date(goal.createdAt).toLocaleDateString()}
      </p>
      <div className="objectivesContainer">
        <h3>Objectives</h3>
        <ul className="objectivesList">
          {goal.objectives &&
            goal.objectives.map((objective) => (
              <li
                key={objective._id}
                className={`objectiveItem ${
                  objective.isDone ? "completed" : "pending"
                }`}
              >
                {objective.title}
              </li>
            ))}
        </ul>
        {showAdd ? (
          <form onSubmit={handleAddObjective} className="goalForm">
            <input
              type="text"
              value={title}
              className="goalInput"
              id="goalTitleInput"
              placeholder="Add Objective"
              onChange={(e) => setTitle(e.target.value)}
            />
            <button type="submit" className="btn goalSubmitBtn" id="addGoalBtn">
              Add New One
            </button>
          </form>
        ) : (
          <button onClick={handleShowAdd} className="btn showAddBtn">
            Add Another Objective
          </button>
        )}
      </div>
    </div>
  );
};

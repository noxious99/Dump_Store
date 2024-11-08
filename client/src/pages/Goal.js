import React, { useEffect, useState } from "react";
import axios from "axios";
import { GoalComponent } from "../components/GoalComponent";
import "../styles/goalStyle.css";

export const Goal = () => {
  const [goals, setGoals] = useState([]);
  const [title, setTitle] = useState("");

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
    <div className="flex flex-col justify-center items-center">
      <div className="relative flex flex-col min-w-[350px] lg:min-w-[60vw] p-5 my-5 rounded-md overflow-hidden">
        {/* Blurred Background Layer */}
        <div className="absolute inset-0 bg-gray-800 backdrop-blur-lg rounded-md opacity-30 z-0"></div>

        {/* Content Layer */}
        <div className="relative z-10 flex flex-col gap-3 font-semibold text-[20px] lg:flex-row lg:justify-between">
          <div className="flex items-center">
            <p className="text-slate-200">Total Set Goal:</p>{" "}
            <span className="text-slate-200 bg-purple-700 rounded-full">
              <p className="ml-1 px-2 py-1 text-[22px]">{goals.length}</p>
            </span>
          </div>
          <div className="flex items-center">
            <p className="text-slate-200">Pending:</p>
            <span className="text-slate-200 bg-red-700 px-2 py-1 rounded-full">
              <p className="ml-1 text-[22px]">
                {goals.length - goals.filter((goal) => goal.isFulfilled).length}
              </p>
            </span>
          </div>
          <div className="flex items-center">
            <p className="text-slate-200">Done:</p>
            <span className="text-slate-200 bg-green-700 px-2 py-1 rounded-full">
              <p className="ml-1 text-[22px]">
                {goals.filter((goal) => goal.isFulfilled).length}
              </p>
            </span>
          </div>
        </div>

        <div className="mt-2 lg:mt-5">
          <form onSubmit={handleAddGoal} className="goalForm">
            <input
              type="text"
              value={title}
              className="goalInput"
              id="goalTitleInput"
              placeholder="What's Your Next Target?"
              onChange={(e) => setTitle(e.target.value)}
            />
            <button
              type="submit"
              style={{ border: "0px" }}
              className="text-[16px] lg:text-[17px] bg-gray-300 text-gray-900 px-4 py-2 font-semibold rounded mt-2 lg:mt-2 transition-all duration-300 hover:bg-gray-900 hover:text-gray-300 z-10"
            >
              Add New One
            </button>
          </form>
        </div>
      </div>

      <div className="goalComponentContainer">
        {goals.map((goal) => (
          <GoalComponent key={goal._id} goal={goal} />
        ))}
      </div>
    </div>
  );
};

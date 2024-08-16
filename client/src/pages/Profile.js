import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

export const Profile = () => {
  const user = useSelector((state) => state.auth.userInfo);
  if (!user) {
    return <p>Loading...</p>;
  }
  const { username, email, avatar } = user;

  return (
    <div>
      <h2>Name: {username}</h2>
      <p>Email: {email}</p>
      <img src={avatar} alt={`${username}'s avatar`} />
    </div>
  );
};

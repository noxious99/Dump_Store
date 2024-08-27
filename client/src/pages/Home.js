import { useState, useEffect } from "react";
import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import down from "../resources/imagesNicons/down.png"
import "../styles/homeStyle.css"

export const Home = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { avatar } = useSelector((state) => state.auth.userInfo || {}); // Safely access avatar
  const [loading, setLoading] = useState(true);


  return (
    <div>
      <h1>HOME</h1>
    </div>
  );
};

import React, { useEffect } from "react";

import logoS from "../resources/imagesNicons/logo-03.png"
import "../styles/homeStyle.css"
import { Link } from "react-router-dom";

export const Home = () => {

  useEffect(() => {
    const handleMouseMove = (e) => {
      const moveX = (window.innerWidth / 2 - e.clientX) * 0.02;
      const moveY = (window.innerHeight / 2 - e.clientY) * 0.02;
      document.getElementById('bgImage').style.transform = `translate(${moveX}px, ${moveY}px)`;
    };
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="container">
      <div id="bgImage"><img src={logoS}/></div>
      <button className="cta-button"><Link to="/login">Get Started</Link></button>
    </div>
  );
};

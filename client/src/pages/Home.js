import React, { useEffect } from "react";
import FilterIcon from "@mui/icons-material/Filter";
import EventNoteIcon from "@mui/icons-material/EventNote";
import { grey } from "@mui/material/colors";
import logoS from "../resources/imagesNicons/logo-03.png";
import "../styles/homeStyle.css";
import { Link } from "react-router-dom";

export const Home = () => {
  useEffect(() => {
    const handleMouseMove = (e) => {
      const moveX = (window.innerWidth / 2 - e.clientX) * 0.02;
      const moveY = (window.innerHeight / 2 - e.clientY) * 0.02;
      document.getElementById(
        "bgImage"
      ).style.transform = `translate(${moveX}px, ${moveY}px)`;
      document.getElementById("bgImage").style.transition =
        "transform 0.1s ease-out";
    };
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div>
      <div className="container">
        <div id="bgImage">
          <img src={logoS} />
        </div>
        <button className="cta-button">
          <Link to="/login">Get Started</Link>
        </button>
      </div>
      <div className="hero-section">
        <h1>Welcome to Dump Store</h1>
        <p>The easy way to store and organize your images and text notes.</p>
        <button className="cta-button2">
          <Link to="/login">Get Started</Link>
        </button>
      </div>

      <div className="features-section">
        <div className="feature-card">
          <FilterIcon sx={{ color: grey[800], fontSize: 30 }} />
          <h3>Image Storage</h3>
          <p>Upload and store your screenshots, photos, and more.</p>
        </div>
        <div className="feature-card">
          <EventNoteIcon sx={{ color: grey[800], fontSize: 30 }} />
          <h3>Text Note Storage</h3>
          <p>Save notes, reminders, or any important text.</p>
        </div>
      </div>
      <section className="motivation">
        <h2>Why Choose Dump Store?</h2>
        <p>
          In today’s world, managing scattered screenshots, images, and text
          notes can be overwhelming. With Dump Store, you can declutter your
          phone and computer storage by organizing your content in one
          convenient place.
        </p>
      </section>
      <div className="use-cases">
        <h2>How People Use Dump Store</h2>
        <div className="use-case">
          <h3>Save Product Screenshots</h3>
          <p>
            Easily capture and organize screenshots of products you want to
            purchase later.
          </p>
        </div>
        <div className="use-case">
          <h3>Text Notes for Quick Reminders</h3>
          <p>
            Keep all your quick text notes in one place, accessible from any
            device.
          </p>
        </div>
      </div>
    </div>
  );
};

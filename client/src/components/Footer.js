import React from "react";
import { Link } from "react-router-dom";
import "../styles/footerStyle.css";
import { Facebook, Twitter, Instagram, LinkedIn } from "@mui/icons-material";

export const Footer = () => {
  return (
    <div className="footerContainer">
      <div className="sector sector01">
        <p>
          <Link to="/policy">Our Policy</Link>
        </p>
      </div>
      <div className="sector sector02">
        <p>
          &copy; 2024 DUMPSTORE | by <span className="highlight">Sa'ad</span>
        </p>
        <div className="socialIcons">
          <a href="https://facebook.com" target="_blank" rel="noreferrer">
            <Facebook className="icon" />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noreferrer">
            <Twitter className="icon" />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer">
            <Instagram className="icon" />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer">
            <LinkedIn className="icon" />
          </a>
        </div>
      </div>
      <div className="sector sector03">
        <p>
          <Link to="/faq">FAQ</Link>
        </p>
      </div>
    </div>
  );
};

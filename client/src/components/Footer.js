import React from "react";
import { Link } from "react-router-dom";
import "../styles/footerStyle.css";
import { Facebook, Twitter, Instagram, LinkedIn } from "@mui/icons-material";

export const Footer = () => {
  return (
    <div className="flex justify-around py-10 lg:py-[60px] bg-[#1D1D1D] text-white shadow-xl">
      <div className="sector sector01">
        <p>
          <Link to="/policy">Our Policy</Link>
        </p>
      </div>
      <div className="sector sector02">
        <p>
          &copy; 2025 DUMPSTORE | by <span className="highlight">Sa'ad</span>
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

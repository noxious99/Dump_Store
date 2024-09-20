import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import "../styles/profileStyle.css";
import { CreateNew } from "../components/createNew";
import { Info } from "../components/Info";
import { MyCollection } from "../components/MyCollection";
import { getPosts } from "../actions/postAction";

//MUI
import PermMediaRoundedIcon from "@mui/icons-material/PermMediaRounded";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import ContactsTwoToneIcon from "@mui/icons-material/ContactsTwoTone";
import { yellow } from "@mui/material/colors";
import { Switch } from "@mui/material";

export const Profile = () => {
  const [paging, setPaging] = useState("");
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getPosts());
  }, [dispatch]);

  const user = useSelector((state) => state.auth.userInfo);
  const totalPosts = useSelector((state) => state.getPost.totalCount);
  if (!user) {
    return <p>Loading...</p>;
  }
  const { username, email, avatar, _id } = user;

  const handlePaging = (val) => {
    setPaging(val);
  };

  const renderPaging = () => {
    switch (paging) {
      case 1:
        return <MyCollection />;
      case 2:
        return <CreateNew />;
      case 3:
        return <Info />;
      default:
        return <Info />;
    }
  };

  return (
    <div>
      <div className="profileContainer">
        <div className="basicInfo">
          <div className="userInfo">
            <div className="profilePic">
              <img src={avatar} alt={`${username}'s avatar`} />
            </div>
            <div>
              <h3 style={{ color: "wheat", marginBottom: "10px" }}>
                User: {username}
              </h3>
            </div>
          </div>
          <div></div>
          <div>
            <div className="editProfile">
              <Link to={`/EditProfile/${_id}`}>Edit Profile</Link>
            </div>
            <div>
              <br />
            </div>
            <h4 style={{ textDecoration: "underline" }}>
              Total Collection:{" "}
              {!totalPosts ? (
                <p>Loading...</p>
              ) : totalPosts === 0 ? (
                <p>No posts available</p>
              ) : (
                totalPosts
              )}
            </h4>
          </div>
        </div>
        <div className="tabs">
          <div id="icon1">
            <button
              onClick={() => handlePaging(1)}
              style={{ backgroundColor: "transparent", border: "none" }}
            >
              <PermMediaRoundedIcon sx={{ color: yellow[200], fontSize: 30 }} />
            </button>
          </div>
          <div id="icon2">
            <button
              onClick={() => handlePaging(2)}
              style={{ backgroundColor: "transparent", border: "none" }}
            >
              <NoteAddIcon sx={{ color: yellow[200], fontSize: 30 }} />
            </button>
          </div>
          <div id="icon3">
            <button
              onClick={() => handlePaging(3)}
              style={{ backgroundColor: "transparent", border: "none" }}
            >
              <ContactsTwoToneIcon sx={{ color: yellow[900], fontSize: 30 }} />
            </button>
          </div>
        </div>
        <div className="profileComponents">{renderPaging()}</div>
      </div>
    </div>
  );
};

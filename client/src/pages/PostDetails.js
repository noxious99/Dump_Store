import React, { useEffect, useState } from "react";
import "../styles/postDetails.css";
import moment from "moment";
import Loader from "../components/Loader";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL;

export const PostDetails = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/post/getone/${id}`, {
          headers: { "Content-Type": "application/json" },
        });
        setPost(res.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching post:", error);
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  if (!post) {
    return <div>Post not found.</div>;
  }

  const { title, image, text, date } = post;

  return (
    <>
      <div className="postContainer">
        <div className="btnContainer">
          <button className="btnSimple">
            <Link to="/profile">Go back</Link>
          </button>
        </div>
        <div className="post-details">
          <div className="post-title">
            <span className="post-date">{moment(date).fromNow()}</span>
            <p className="post-title-text">{title}</p>
          </div>
          {image ? (
            <div className="image-container">
              <img src={image} alt={title} className="post-image" />
            </div>
          ) : (
            <p className="post-description">{text}</p>
          )}
          <p className="post-description">{text}</p>
        </div>
      </div>
    </>
  );
};

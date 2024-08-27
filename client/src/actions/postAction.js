import React from "react";
import axios from "axios";

export const postAction = (postData) => async (dispatch) => {
  dispatch({ type: "POST_LOADING" });
  try {
    const token = localStorage.getItem("authToken");
    const response = await axios.post(
      "http://localhost:8000/api/post/",
      postData,
      {
        headers: { "x-auth-token": token },
      }
    );
    dispatch({ type: "POST_SUCCESS", payload: response.data });
  } catch (error) {
    dispatch({ type: "POST_FAILED", payload: error.message });
  }
};

export const getPosts = () => async (dispatch) => {
  dispatch({ type: "GET_POST_LOADING" });
  try {
    const token = localStorage.getItem("authToken");
    const response = await axios.get("http://localhost:8000/api/post/", {
      headers: { "x-auth-token": token },
    });
    dispatch({ type: "GET_POST_SUCCESS", payload: response.data });
  } catch (error) {
    dispatch({ type: "GET_POST_SUCCESS", payload: error.message });
  }
};

export const upVote = (id) => async (dispatch) => {
  dispatch({ type: "UPVOTE_LOADING" });
  try {
    const token = localStorage.getItem("authToken");
    const response = await axios.put(
      `http://localhost:8000/api/post/upvote/${id}`,
      {},
      {
        headers: { "x-auth-token": token },
      }
    );
    dispatch({ type: "UPVOTE_SUCCESS", payload: response.data });
  } catch (error) {
    dispatch({ type: "UPVOTE_FAILED", payload: error.message });
  }
};

export const downVote = (id) => async (dispatch) => {
  dispatch({ type: "DOWNVOTE_LOADING" });
  try {
    const token = localStorage.getItem("authToken");
    const response = await axios.put(
      `http://localhost:8000/api/post/downvote/${id}`,
      {},
      {
        headers: { "x-auth-token": token },
      }
    );
    dispatch({ type: "DOWNVOTE_SUCCESS", payload: response.data });
  } catch (error) {
    dispatch({ type: "DOWNVOTE_FAILED", payload: error.message });
  }
};

export const deletePost = (id) => async (dispatch) => {
  dispatch({ type: "DELETE_LOADING" });
  try {
    const token = localStorage.getItem("authToken");
    const response = await axios.delete(
      `http://localhost:8000/api/post/${id}`,
      {
        headers: { "x-auth-token": token },
      }
    );
    dispatch({ type: "DELETE_SUCCESS", payload: response.data });
  } catch (error) {
    dispatch({ type: "DELETE_FAILED", payload: error.message });
  }
};


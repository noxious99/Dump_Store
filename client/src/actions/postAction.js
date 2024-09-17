import React from "react";
import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL;

export const postAction = (postData) => async (dispatch) => {
  dispatch({ type: "POST_LOADING" });
  try {
    const token = localStorage.getItem("authToken");
    const response = await axios.post(
      `${API_URL}/api/post/`,
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

export const getPosts = (page) => async (dispatch) => {
  dispatch({ type: "GET_POST_LOADING" });
  try {
    const token = localStorage.getItem("authToken");
    const response = await axios.get(`${API_URL}/api/post/?page=${page}` , {
      headers: { "x-auth-token": token },
    });
    dispatch({ type: "GET_POST_SUCCESS", payload: response.data});
  } catch (error) {
    dispatch({ type: "GET_POST_SUCCESS", payload: error.message });
  }
};

export const upVote = (id) => async (dispatch) => {
  dispatch({ type: "UPVOTE_LOADING" });
  try {
    const token = localStorage.getItem("authToken");
    const response = await axios.put(
      `${API_URL}/api/post/upvote/${id}`,
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
      `${API_URL}/api/post/downvote/${id}`,
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
      `${API_URL}/api/post/${id}`,
      {
        headers: { "x-auth-token": token },
      }
    );
    dispatch({ type: "DELETE_SUCCESS", payload: response.data });
  } catch (error) {
    dispatch({ type: "DELETE_FAILED", payload: error.message });
  }
};

export const getAllPosts = (page) => async (dispatch) => {
  dispatch({ type: "GET_ALL_POST_LOADING" });
  try {
    const token = localStorage.getItem("authToken");
    const response = await axios.get(`${API_URL}/api/post/all?page=${page}`, {
    });
    dispatch({ type: "GET_ALL_POST_SUCCESS", payload: response.data });
  } catch (error) {
    dispatch({ type: "GET_ALL_POST_FAILURE", payload: error.message });
  }
};
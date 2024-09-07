import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllPosts } from "../actions/postAction";

import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

export const Allpost = () => {
  const [page, setPage] = useState(0); // Initialize page to 0 (or 1 based on your logic)
  const [totalPages, setTotalPages] = useState(0); // To store total pages

  const postsPerPage = 5; // Define how many posts per page

  const handlePage = (event, value) => {
    setPage(value-1); // Update the page number when the button is clicked
    console.log(page);
  };

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllPosts(page)); // Fetch posts based on the current page
  }, [dispatch, page]);

  const { PagePosts: posts, isLoading } = useSelector(
    (state) => state.pagePost
  ); // Using PagePosts from reducer

  useEffect(() => {
    if (posts) {
      const totalPosts = posts.length; // Total posts from the API
      setTotalPages(15); // Calculate the total pages
    }
  }, [posts]);

  return (
    <div>
      <div>
        {isLoading ? (
          <p>Loading posts...</p>
        ) : posts && posts.length > 0 ? (
          posts.map((post) => (
            <div key={post._id}>
              <h3>{post.title}</h3>
              <p>{post.text}</p>
            </div>
          ))
        ) : (
          <p>No posts available</p>
        )}
      </div>

      <div>
        {/* Render pagination buttons based on totalPages */}
        {Array.from({ length: totalPages }, (_, index) => (
          <button key={index} onClick={() => handlePage(index)}>
            {index + 1}
          </button>
        ))}
      </div>
      <Stack spacing={4}>
        <Pagination count={totalPages} page={page + 1} variant="outlined" color="secondary"  onChange={handlePage}/>
        <Pagination count={totalPages} variant="outlined" disabled />
      </Stack>
    </div>
  );
};

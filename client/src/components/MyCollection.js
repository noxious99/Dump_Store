import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deletePost, downVote, getPosts, upVote } from "../actions/postAction";
import { PostComponent } from "./PostComponent";
import "../styles/profileStyle.css";
import Loader from "./Loader";

// MUI
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Unstable_Grid2";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { Link } from "react-router-dom";

export const MyCollection = () => {
  const [page, setPage] = useState(0);
  const [pageNum, setPageNum] = useState(5);

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getPosts(page));
  }, [dispatch, page]);

  const { username } = useSelector((state) => state.auth.userInfo || []);
  const posts = useSelector((state) => state.getPost.allPost || []);
  const totalPost = useSelector((state) => state.getPost.totalCount);
  const isLoading = useSelector((state) => state.getPost.isLoading);
  const voteLoading = useSelector((state) => state.getPost.voteLoading);
  const deleteLoading = useSelector((state) => state.getPost.deleteLoading);

  useEffect(() => {
    if (posts) {
      const total = Math.ceil(totalPost / 5);
      setPageNum(total);
    }
  }, [posts]);

  const handlePagination = (event, value) => {
    setPage(value - 1);
  };

  const handleImageClick = (image) => {
    window.open(image, "_blank");
  };

  const handleUpVote = (id) => {
    dispatch(upVote(id));
  };
  const handleDownVote = (id) => {
    dispatch(downVote(id));
  };
  const handleDelete = (id) => {
    dispatch(deletePost(id));
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          padding: "20px",
        }}
      >
        <div style={{ alignSelf: "center" }}>
          {isLoading && <Loader />}
          {!isLoading && posts?.length === 0 && (
            <Typography>No posts available</Typography>
          )}
        </div>
        <div style={{ alignSelf: "center", margin: "20px" }}>
          <Grid
            container
            spacing={{ xs: 2, md: 6 }}
            columns={{ xs: 4, sm: 8, md: 12 }}
            justifyContent="center"
          >
            {posts?.length > 0 &&
              !isLoading &&
              posts.map((post) => (
                <Grid key={post._id} size={{ xs: 2, sm: 4, md: 4 }}>
                  <PostComponent
                    post={post}
                    handleDelete={handleDelete}
                    deleteLoading={deleteLoading}
                    handleUpVote={handleUpVote}
                    handleDownVote={handleDownVote}
                    voteLoading={voteLoading}
                  />
                </Grid>
              ))}
          </Grid>
        </div>
        <div style={{ alignSelf: "center", margin: "20px" }}>
          <Stack spacing={4}>
            <Pagination
              count={pageNum}
              page={page + 1}
              variant="outlined"
              color="secondary"
              onChange={handlePagination}
            />
            <Pagination count={pageNum} variant="outlined" disabled />
          </Stack>
        </div>
      </div>
    </>
  );
};

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deletePost, downVote, getPosts, upVote } from "../actions/postAction";
import moment from "moment";
import "../styles/profileStyle.css";
import Loader from "./Loader";

// MUI
import Card from "@mui/material/Card";
import { Button, Tooltip } from "@mui/material";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import { red, grey, yellow } from "@mui/material/colors";
import DeleteIcon from "@mui/icons-material/Delete";
import LoupeOutlinedIcon from "@mui/icons-material/LoupeOutlined";
import RemoveCircleOutlineOutlinedIcon from "@mui/icons-material/RemoveCircleOutlineOutlined";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

export const MyCollection = () => {
  const [page, setPage] = useState(0);
  const [pageNum, setPageNum] = useState(5);

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getPosts(page));
  }, [dispatch, page]);

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
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <div style={{ alignSelf: "center" }}>
        {isLoading && <Loader />}
        {!isLoading && posts?.length === 0 && (
          <Typography>No posts available</Typography>
        )}
      </div>
      <div>
        <Grid
          container
          spacing={6}
          sx={{
            margin: "auto",
            marginBottom: 2,
            boxSizing: "border-box",
            justifyContent: {
              xs: "center",
              sm: "flex-start",
            },
            alignItems: "flex-start",
            overflow: "hidden",
            spacing: {
              md: 4,
            },
          }}
        >
          {posts?.length > 0 &&
            !isLoading &&
            posts.map((post) => {
              let mdValue;
              let mdWidth;

              if (posts.length === 1) {
                mdValue = 12;
                mdWidth = "500px";
              } else if (posts.length === 2) {
                mdValue = 6;
                mdWidth = "400px";
              } else {
                mdValue = 4;
                mdWidth = "400px";
              }

              return (
                <Grid item xs={12} sm={6} md={mdValue} key={post._id}>
                  <Card
                    sx={{
                      height: "auto",
                      width: { xs: "100%", sm: "350px", md: { mdWidth } },
                      maxWidth: { xs: "100%", sm: "350px", md: { mdWidth } },
                      borderRadius: 4,
                      boxShadow: 4,
                      backgroundColor: post.image ? "white" : "#fff59d",
                      marginLeft: { xs: "-50px", sm: "0px", md: "-30px" },
                    }}
                  >
                    <CardHeader
                      sx={{ bgcolor: grey[900], color: grey[100] }}
                      avatar={
                        <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
                          R
                        </Avatar>
                      }
                      action={
                        <IconButton
                          aria-label="delete"
                          color="error"
                          sx={{ fontSize: "30px" }}
                          onClick={() => handleDelete(post._id)}
                          disabled={deleteLoading}
                        >
                          <DeleteIcon fontSize="30px" />
                        </IconButton>
                      }
                      title={post.title}
                      subheader={moment(post.date).fromNow()}
                    />
                    {post.image ? (
                      <Tooltip title="Click to enlarge the image" arrow>
                        <a
                          href={post.image}
                          onClick={(e) => e.preventDefault()}
                          style={{ cursor: "pointer" }}
                        >
                          <CardContent>
                            <img
                              src={post.image}
                              alt="Post"
                              style={{
                                width: "100%",
                                height: "auto",
                                maxHeight: "300px",
                                borderRadius: 4,
                                cursor: "zoom-in",
                              }}
                              onClick={() => handleImageClick(post.image)}
                            />
                          </CardContent>
                        </a>
                      </Tooltip>
                    ) : (
                      <CardContent>
                        <Typography
                          variant="h6"
                          color="black"
                          align="center"
                          sx={{ padding: 2 }}
                        >
                          {post.text}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          align="center"
                        >
                          {post.image ? post.text : "Note"}
                        </Typography>
                      </CardContent>
                    )}
                    <Typography variant="body2" color="text.secondary">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginLeft: "10px",
                        }}
                      >
                        <span>Priority:</span>
                        <span style={{ marginLeft: "2px", marginTop: "2px" }}>
                          {post.vote}
                        </span>
                      </div>
                    </Typography>
                    <IconButton
                      aria-label="Priority Up"
                      color="success"
                      sx={{ fontSize: "25px" }}
                      onClick={() => handleUpVote(post._id)}
                      disabled={voteLoading}
                    >
                      <LoupeOutlinedIcon />
                    </IconButton>
                    <IconButton
                      aria-label="Priority Down"
                      color="secondary"
                      sx={{ fontSize: "25px" }}
                      onClick={() => handleDownVote(post._id)}
                      disabled={voteLoading}
                    >
                      <RemoveCircleOutlineOutlinedIcon />
                    </IconButton>
                  </Card>
                </Grid>
              );
            })}
        </Grid>
      </div>
      <div style={{ alignSelf: "center" }}>
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
  );
};

import React from "react";
import moment from "moment";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import { red, grey, yellow } from "@mui/material/colors";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import LoupeOutlinedIcon from "@mui/icons-material/LoupeOutlined";
import RemoveCircleOutlineOutlinedIcon from "@mui/icons-material/RemoveCircleOutlineOutlined";
import { Link } from "react-router-dom";

export const PostComponent = ({
  post,
  handleDelete,
  deleteLoading,
  handleUpVote,
  handleDownVote,
  voteLoading,
}) => {
  console.log(post);
  return (
    <div>
      <Card sx={{ minWidth: 350 }}>
        <CardHeader
          avatar={<Avatar sx={{ bgcolor: red[500] }} aria-label=""></Avatar>}
          action={
            <IconButton
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
        <Link
          to={{
            pathname: `/PostDetails/${post._id}`,
            state: { post },
          }}
          style={{
            textDecoration: "none",
            color: "#000000",
            fontWeight: "600",
          }}
        >
          <CardMedia
            component="img"
            height="194"
            image={post.image}
            alt="Note"
          />
        </Link>
        <CardContent>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {post.text}
          </Typography>
        </CardContent>
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
    </div>
  );
};

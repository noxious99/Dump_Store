const express = require("express");
const postRoute = express.Router();

const Post = require("../Schemas/postSchema");
const auth = require("../middleware/auth");

//Create new post
postRoute.post("/", auth, async (req, res) => {
  const { title, text, image } = req.body;
  try {
    const post = await new Post({
      title,
      text,
      image,
      author: req.user.id,
    });
    post.save();
    res.status(200).json(post);
  } catch (err) {
    return res.status(400).json({ err: err });
  }
});

//Get post of user
postRoute.get("/", auth, async (req, res) => {
  try {
    const id = await req.user.id;
    const posts = await Post.find({ author: id }).sort({ date: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res.status(400).json({ err: err });
  }
});

//Delete a post
postRoute.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({ _id: req.params.id });
    console.log(req.params.id);
    if (!post) {
      return res.status(400).json({ err: "No Such File to Delete" });
    }
    res.status(200).json(post);
  } catch (err) {
    res.status(400).json({ err: err });
  }
});

//UPvote a post
postRoute.put("/upvote/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(400).json({ err: "No Such File to Vote" });
    }
    post.vote = post.vote + 1;
    await post.save();
    return res.status(200).json(post);
  } catch (err) {
    return res.status(400).json({ err: err });
  }
});

//Downvote a post
postRoute.put("/downvote/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(400).json({ err: "No Such File to Delete" });
    }
    if (post.vote > 0) {
      post.vote = post.vote - 1;
    } else {
      return res.json({ mssg: "It is Already Downed to its Maximum" });
    }
    await post.save();
    res.status(200).json(post);
  } catch (err) {
    return res.status(400).json({ err: err });
  }
});

module.exports = postRoute;

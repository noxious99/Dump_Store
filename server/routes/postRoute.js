const express = require("express");
const postRoute = express.Router();
const cloudinary = require("../utils/cloudinaryV2.js");
// const { upload } = require("../middleware/multerMiddleware.js");
const upload = require("../middleware/multerMiddlewareV2.js");

const Post = require("../Schemas/postSchema");
const auth = require("../middleware/auth");

//Create new post

postRoute.post("/", auth, upload.single("image"), async (req, res) => {
  const { title, text } = req.body;
  try {
    const imageFile = req.file;
    let image = null;

    if (imageFile) {
      const cloudinaryResponse = await cloudinary.uploadOnCloudinary(
        imageFile.buffer
      ); // Pass the file buffer to the uploadOnCloudinary function
      if (!cloudinaryResponse) {
        return res
          .status(500)
          .json({ err: { mssg: "Failed to upload image to Cloudinary" } });
      }
      image = cloudinaryResponse.url;
    }

    const post = await new Post({
      title,
      text,
      author: req.user.id,
      image,
    });
    await post.save(); // Make sure to await the save operation
    res.status(200).json(post);
  } catch (err) {
    console.error("Error uploading image:", err); // Log the error for debugging
    return res.status(400).json({ err: err });
  }
});

// postRoute.post("/", auth, upload.single("image"), async (req, res) => {
//   const { title, text } = req.body;
//   try {
//     const imageFile = req.file;
//     if (imageFile) {
//       const cloudinaryResponse = await cloudinary.uploadOnCloudinary(
//         imageFile.path
//       );
//       if (!cloudinaryResponse) {
//         return res
//           .status(500)
//           .json({ err: { mssg: "Failed to upload image to Cloudinary" } });
//       }
//       image = cloudinaryResponse.url;
//     }
//     const post = await new Post({
//       title,
//       text,
//       author: req.user.id,
//       image,
//     });
//     post.save();
//     res.status(200).json(post);
//   } catch (err) {
//     return res.status(400).json({ err: err });
//   }
// });

// postRoute.post("/", auth, async (req, res) => {
//   const { title, text, image } = req.body;
//   try {
//     const post = await new Post({
//       title,
//       text,
//       image,
//       author: req.user.id,
//     });
//     post.save();
//     res.status(200).json(post);
//   } catch (err) {
//     return res.status(400).json({ err: err });
//   }
// });

//Get post of user
// postRoute.get("/", auth, async (req, res) => {
//   try {
//     const id = await req.user.id;
//     const posts = await Post.find({ author: id }).sort({ date: -1 });
//     res.status(200).json(posts);
//   } catch (err) {
//     res.status(400).json({ err: err });
//   }
// });

postRoute.get("/", auth, async (req, res) => {
  try {
    const id = await req.user.id;
    const page = (await parseInt(req.query.page)) || 0;
    const limit = (await parseInt(req.query.limit)) || 5;
    const totalPosts = await Post.countDocuments({ author: id });

    const posts = await Post.find({ author: id })
      .sort({ date: -1 })
      .limit(limit)
      .skip(page * limit);
    res.status(200).json({ posts, totalPosts });
    // console.log(totalPosts);
  } catch (err) {
    res.status(400).json({ err: err });
  }
});

postRoute.get("/all/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 5;
    const skip = page * limit;
    const allposts = await Post.find().skip(skip).limit(limit);
    // console.log(`Page: ${page}, Limit: ${limit}, Skip: ${skip}`);
    res.status(200).json(allposts);
  } catch (err) {
    res.status(400).json({ err: err });
  }
});

postRoute.get("/getone/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const post = await Post.findById(id);
    res.status(200).json(post);
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

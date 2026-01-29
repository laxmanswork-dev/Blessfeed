const express = require("express");
const Post = require("../models/post.model");
const auth = require("../auth_middleware");

const router = express.Router();

// CREATE POST
router.post("/", auth, async (req, res) => {
  try {
    const { title, content, mood } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content required" });
    }

    const post = await Post.create({
      user: req.userId,
      title,
      content,
      mood,
    });

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET FEED
router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find({ isDeleted: false })
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

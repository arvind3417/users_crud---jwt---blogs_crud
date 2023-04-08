// const express = require('express');

const { Post } = require('../models/db-schemas');

module.exports. getposts = async (req, res) => {
  try {
    const userId  = req.user._id;
    const posts = await Post.find({"createdBy": userId});
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

// POST create post
module.exports. createpost = async (req, res) => {
  try {
    const { message } = req.body;
    const userId  = req.user._id;


    const post = new Post({
      createdBy: userId,
      message
    });
const savedpost =await post.save();
    res.status(201).json(savedpost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

// DELETE post (only available for creators of post)
module.exports. deletepost = async (req, res) => {
  try {
    const  userId  = req.user._id;
    const { id } = req.params;

    const post = await Post.findOne({ _id: id, createdBy: userId });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await post.deleteOne();

    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

// PUT update post (only available for creators of post)
module.exports. updatepost = async (req, res) => {
  try {
    const  userId  = req.user._id;
    const { id } = req.params;
    const { message } = req.body;

    const post = await Post.findOne({ _id: id, createdBy: userId });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.message = message;
    post.updatedAt = new Date();

    await post.save();

    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

// Authenticate middleware (verify JWT token)
// const authenticate = (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader) {
//     return res.status(401).json({ message: 'Authorization header missing' });
//   }

//   const token = authHeader.split(' ')[1];

//   try {
//     const decoded = jwt.verify(token, 'secret');
//     req.user = decoded;
//     next();
//   } catch (err) {
//     console.error(err);
//     res.status(401).json({ message: 'Invalid or expired token' });
//   }
// };



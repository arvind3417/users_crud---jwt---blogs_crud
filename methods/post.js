

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
    const { message,comments } = req.body;

    const post = await Post.findOne({ _id: id, createdBy: userId });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.message = message;
    post.comments = comments;
    post.updatedAt = new Date();

    await post.save();

    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}




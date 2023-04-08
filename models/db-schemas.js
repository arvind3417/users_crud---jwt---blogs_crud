const mongoose = require('mongoose');

// Define the comment schema
const commentSchema = new mongoose.Schema({
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sentAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  liked: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

// Define the post schema
const postSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  comments: [commentSchema]
});

// Define the user schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    
  },
  mobile: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

// Create the Post model
const Post = mongoose.model('Post', postSchema);

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = { Post, User };

const express = require('express');
const mongoose = require("mongoose");
const userrouter = require("./routes/user-routes")
const postrouter = require('./routes/posts-routes')

const app = express()
app.use(express.json());
app.use("/user",userrouter)
app.use("/posts",postrouter)


// require('dotenv').config()
const port = process.env.PORT || 5000
mongoose.connect('mongodb://127.0.0.1:27017/varlyq' , {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });
app.listen(port,(req,res)=>{console.log(`server hitt on ${port}`)})
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
mongoose.connect('mongodb+srv://admin:admin@cluster0.8unxxd0.mongodb.net/varlyq' , {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });
  app.get('/', (req, res) => {
    res.send("Hi there love you")
  });
app.listen(port,(req,res)=>{console.log(`server hitt on ${port}`)})
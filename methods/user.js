// const express = require('express');
const { User } = require("../models/db-schemas");
// const middleware = require("./middleware/mid")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
// const app = express();
// app.use(express.json());

// GET all users
module.exports.getAll = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST a new user
// module.exports.newUser = async (req, res) => {
//   try {
//         // Hash the password
//         const saltRounds = 10;
//         const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
//         console.log(req.body.password);

//         // Create the user
//         const user = new User({
//           name: req.body.name,
//           email: req.body.email,
//           mobile: req.body.mobile,
//           password: hashedPassword
//         });

//         await user.save();

//         // Generate a JWT token
//         const token = jwt.sign({ _id: user._id }, "secret");

//         res.status(201).json({ user, token });
//       }
//     // const user = new User(req.body);
//     // await user.save();
//     // res.status(201).json(user);

//   catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// }
module.exports.signup = async (req, res, next) => {
  const { name, email, mobile, password } = req.body;

  // else{
  try {
  let existingUser;

    existingUser = await User.findOne({ email });
    if (existingUser) {
 
      res.json({
        message: "user exist please try logging in instead of signing up",
      });
    } else {
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const user = new User({
        name,
        email,
        mobile,
        password: hashedPassword,
      });

     
      await user.save();
  
      const token = jwt.sign({ _id: user._id }, "secret");
    
      return res.status(200).json({ user: user, token });
    }
  } catch (error) {
    console.log(error);
  }

  // }
};

module.exports.login = async (req, res) => {
  const { email, password } = req.body;
  let user;
  try {
    user = await User.findOne({ email });
    //let isMatch = await bcrypt.compare(req.body.password,user.password);
  } catch (error) {
    console.log(error);
  }
  if (!user) {
    return res.json({ message: "User not found" });
  } else {
    const isPasswordCorrect = bcrypt.compareSync(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(200).json({ message: "Incorrect password" });
    } else {
      const token = jwt.sign({ _id: user._id }, "secret");
      // const token =JWT.sign({email}, "nfb32iur32ibfqfvi3vf932bg932g", {expiresIn: 360000});

      // console.log(token);

      return res.status(200).json({ message: "login success", token });
    }
  }
};

// DELETE a user
module.exports.deleteUser = async (req, res) => {
  try {
    // if (req.user._id.toString() !== req.params.id) {
    //     res.status(401).json({ error: 'Unauthorized' });
    // } else {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
    } else {
      res.status(204).end();
      console.log("success");
    }
    // }
    // const user = await User.findByIdAndDelete(req.params.id);
    // if (!user) {
    //   res.status(404).json({ error: 'User not found' });
    // } else {
    //   res.status(204).end();
    // }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT an updated user
module.exports.updateUser = async (req, res) => {
  try {
    // if (req.user._id.toString() !== req.params.id) {
    //     res.status(401).json({ error: 'Unauthorized' });
    //   } else {
    const { name, email, mobile, password } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, mobile, password: hashedPassword },
      { new: true }
    );
    // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    // if (!user) {
    //   res.status(404).json({ error: 'User not found' });
    // } else {
    res.status(200).json(user);
    // }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Start the server
// app.listen(3000, () => {
//   console.log('Server listening on port 3000');
// });

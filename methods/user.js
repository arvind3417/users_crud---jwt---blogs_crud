
const { User } = require("../models/db-schemas");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const redis = require("redis");
const client = redis.createClient();
client.on("error", function (error) {
  console.error(error);
});

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
// module.exports.signup = async (req, res, next) => {
//   const { name, email, mobile, password } = req.body;


//   try {
//   let existingUser;

//     existingUser = await User.findOne({ email });
//     if (existingUser) {
 
//       res.json({
//         message: "user exist please try logging in instead of signing up",
//       });
//     } else {
//       // Hash the password
//       const saltRounds = 10;
//       const hashedPassword = await bcrypt.hash(password, saltRounds);

//       const user = new User({
//         name,
//         email,
//         mobile,
//         password: hashedPassword,
//       });

     
//       await user.save();
  
//       const token = jwt.sign({ _id: user._id }, "secret");
    
//       return res.status(200).json({ user: user, token });
//     }
//   } catch (error) {
//     console.log(error);
//   }

// };


module.exports.signup = async (req, res, next) => {
  const { name, email, mobile, password } = req.body;

  try {
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists. Please try logging in instead of signing up",
      });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user
    const user = new User({
      name,
      email,
      mobile,
      password: hashedPassword,
    });

    await user.save();

    const accessToken = jwt.sign({ userId: user._id },"secret", {
      expiresIn: "1m",
    });

    const refreshToken = jwt.sign({ userId: user._id }, "secret");

    try {
  await client.connect();

      await client.set(user._id.toString(), refreshToken);
      await client.disconnect();
      console.log('Refresh token added to Redis');
    } catch (error) {
      console.log(error);
    }

    return res.status(200).json({ accessToken, refreshToken });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};


module.exports.login = async (req, res) => {
  // await client.connect();
  const { email, password } = req.body;
  let user;
  try {
    user = await User.findOne({ email });
  } catch (error) {
    console.log(error);
  }
  if (!user) {
    return res.json({ message: "User not found" });
  } else {
    const isPasswordCorrect = bcrypt.compareSync(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(200).json({ message: "Incorrect credentials" });
    } else {
      const token = jwt.sign({ _id: user._id }, "secret", {
        expiresIn: "1m",
      });
  
      const refreshToken = jwt.sign(
        { _id: user._id },
        "secret"
        
      );
  await client.connect();
  
    await  client.set(user._id.toString(), refreshToken);
    await client.disconnect();
  
      return res.status(200).json({ message: 'Login success', token, refreshToken });
    }
  }
};

// DELETE a user
module.exports.deleteUser = async (req, res) => {
  try {

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
    } else {
      res.status(204).end();
      console.log("success");
    }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT an updated user
module.exports.updateUser = async (req, res) => {
  try {

    const { name, email, mobile, password } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, mobile, password: hashedPassword },
      { new: true }
    );

    res.status(200).json(user);
    // }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};



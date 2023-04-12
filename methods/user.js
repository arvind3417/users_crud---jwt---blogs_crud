
const { User } = require("../models/db-schemas");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const redis = require("redis");
const nodemailer = require("nodemailer")
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


module.exports.forgotpass = async (req,res)=> {
try {
  const user = await User.findOne({email : req.body.email})
  if(!user){
    res.json({message: "there is no such user enter the email properly"})
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'buggercyber@gmail.com',
      pass: 'nuurklixnnnpmvoh'
    }
  });

        const token = jwt.sign({ email:req.body.email }, "secret" )

        user.regeneratedPassToken = token
        
        await user.save();
        console.log('====================================');
        console.log(user.regeneratedPassToken);
        console.log('====================================');

        const resetLink = `http://localhost:5000/user/reset-pass/${token}`;
        console.log(resetLink);
        const mailOptions = {
          from: "buggercyber@gmail.com",
          to: user.email,
          subject: 'Password Reset Request',
          html: `Click <a href="${resetLink}">here</a> to reset your password. This link is valid for 1 hour.`
        };
        await transporter.sendMail(mailOptions);
    
        res.json({ message: 'Password reset link sent to your email' });





} catch (error) {
  console.log(error);
  res.json({err : error})
  
}
}

module.exports.resetpass =  async (req, res) => {
  try {
    const  token  = req.params.token;
    const { password } = req.body;
    console.log('====================================');
    console.log();
    console.log(token);

    console.log('====================================');

    const user = await User.findOne({
      regeneratedPassToken: token,
      // resetPasswordExpires: { $gt: Date.now() },
    });
    console.log('====================================');
    console.log(user);
    console.log('====================================');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    if (!password) {
      return res.status(400).json({ message: 'Invalid password' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('====================================');
    console.log("asndj");
    console.log(hashedPassword);
    console.log('====================================');


    user.password = hashedPassword;
  //  user.regeneratedPassToken = "";
    // user.resetPasswordExpires = null;
    console.log(user.password);

    await user.save();
    console.log('====================================');
    console.log("done");
    console.log('====================================');
    res.status(200).json({ message: 'Password reset successful' });

  }
  catch(e){
console.log(e);
res.json({message : e})
  }
}
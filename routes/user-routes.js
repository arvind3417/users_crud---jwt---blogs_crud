const express = require('express');
const router = express.Router()
const {signup,login,updateUser,deleteUser,getAll,forgotpass,resetpass} = require("../methods/user")

router.post("/signin-user",signup);
router.post("/login-user",login);
router.post("/forgot-pass",forgotpass)
router.post("/reset-pass/:token",resetpass)

router.get("/get-users",getAll)
router.put("/update-user/:id",updateUser)
router.delete("/delete-user/:id",deleteUser)

module.exports = router;
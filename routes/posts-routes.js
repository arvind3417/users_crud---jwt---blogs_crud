const express=require('express')
const router=express.Router()
const auth=require('../middleware/mid');
const {createpost,getposts,updatepost,deletepost}= require('../methods/post')
//const Post = require('../models/posts');
router.post('/createpost',auth,createpost);
router.get('/getposts',auth,getposts);
router.put('/update/:id',auth,updatepost)
router.delete('/delete/:id',auth,deletepost)
module.exports=router;
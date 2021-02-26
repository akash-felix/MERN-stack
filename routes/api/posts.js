const express = require ('express');
const router=express.Router();
const {check,validationResult}=require('express-validator/check');
const auth=require('../../middleware/auth');
const User=require('../../models/User');
const Profile=require('../../models/Profile');
const Post=require('../../models/Posts');
//create api/post 
router.post('/',[auth,
    check('text','Text is required').notEmpty(),
],async(req,res)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res
        .status(500)
        .json({errors:errors.array()});
    }
    try {
        const user= await User.findById(req.user.id).select('-password');
        const newPost= new Post({
            text:req.body.text,
            name:user.name,
            avatar:user.avatar,
            user:req.user.id
        })
        const post=await newPost.save();
        res.json(post);
    } catch (err) {
        console.error(err.message);
        res
        .status(500)
        .send('Server Error');
    }

});
//get all posts
router.get('/',auth,async(req,res)=>{
    try{
    const posts=await Post.find().sort({date:-1});
    res
    .json(posts);
    }
    catch(err){
        console.error(err.message);
        res
        .status(500)
        .send('Server Error');
    }
});
//get post by id
router.get('/:id',auth,async(req,res)=>{
    try{
    const post=await Post.findById(req.params.id);
        if(!post){
            return res
            .status(404)
            .json({msg:'Post not found'});
        }
    res
    .json(post);
    }
    catch(err){
        console.error(err.message);
        if(err.kind==='ObjectId'){
            return res
            .status(404)
            .json({msg:'Post not found'});
        }
        res
        .status(500)
        .send('Server Error');
    }
});
//delete post
router.delete('/:id',auth,async(req,res)=>{
    try{
        const post=await Post.findById(req.params.id);
        if(post.user.toString()!==req.user.id){
            return res
            .status(401)
            .json({msg:'User not authorized'});
        }
        await Post.remove();
        res.json('Post removed');
    }
    catch(err){
        console.error(err.message);
        if(err.kind==='ObjectId'){
            return res
            .status(404)
            .json({msg:'Post not found'});
        }
        res
        .status(500)
        .json('Server Error');
    }
});
//like post by id
router.put('/like/:id', auth, async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
  
      // Check if the post has already been liked
      if(
        post.likes.filter(like=>like.user.toString()===req.user.id).length>0){
        return res
        .status(400)
        .json({msg:'Post is already liked'});
    }
  
      post.likes.unshift({ user: req.user.id });
  
      await post.save();
  
      return res.json(post.likes);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });
  //unlike
  router.put('/unlike/:id', auth, async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
  
      // Check if the post has already been liked
      if(
        post.likes.filter(like=>like.user.toString()===req.user.id).length===0){
        return res
        .status(400)
        .json({msg:'Post is not liked'});
    }
  
      //get remove index
      const removeIndex= await post.likes.map(like=>like.user.toString()).indexOf(req.user.id);
        post.likes.splice(removeIndex,1);
      await post.save();
  
      return res.json(post.likes);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });
//comment a post 
router.post('/comment/:id',[
    auth,
    check('text','Text is required').notEmpty()],async(req,res)=>{
        const errors=validationResult(req);
        if(!errors.isEmpty()){
            return res
            .status(400)
            .json({errors:errors.array()});
        }
    try{
        const user=await User.findById(req.user.id).select('-password');
        const post=await Post.findById(req.params.id);
        const newComment={
            text:req.body.text,
            name:user.name,
            avatar:user.avatar,
            user:req.user.id
        };
        post.comments.unshift(newComment);
        await post.save();
        res.json(post.comments);
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
router.delete('/comment/:id/:comment_id',auth,async(req,res)=>{
    try{
        const post=await Post.findById(req.params.id);
        //pull out comment
        const comment=await post.comments.find(comment=>comment.id===req.params.comment_id);
        if(!comment){
            return status(404).json({msg:'Comment does not exists'});
        }
        //to check user
        if(comment.user.toString()!==req.user.id){
            return res.status(401).json({msg:'User not Suthorized'});
        }
        const removeIndex= post.comments.map(comment=>comment.user.toString()).indexOf(req.user.id);

        post.comments.splice(removeIndex,1);
        await post.save();
        return res.json(post.comments);
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports=router;
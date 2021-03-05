const express = require('express');
const router = express.Router();
const request=require('request');
const config=require('config');
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
// bring in normalize to give us a proper url, regardless of what user entered

const Profile = require('../../models/Profile');
const User = require('../../models/Profile');
const Post=require('../../models/Posts');
// @route    GET api/profile/me
// @desc     Get current users profile
// @access   Private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id
    }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    POST api/profile
// @desc     Create or update user profile
// @access   Private
router.post(
  '/',
  auth,
  check('skills', 'Skills is required').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    }=req.body;
    const profilefields={};
    profilefields.user=req.user.id;
    if(company)profilefields.company=company;
    if(website)profilefields.website=website;
    if(location)profilefields.website=location;
    if(bio)profilefields.website=bio;
    if(status)profilefields.website=status;
    if(githubusername)profilefields.website=githubusername;
    if(skills){
        profilefields.skills=skills.split(',').map(skill=>skill.trim());
    } 
    profilefields.social={};
    if(youtube) profilefields.social.youtube=youtube;
    if(facebook) profilefields.social.youtube=facebook;
    if(twitter) profilefields.social.youtube=twitter;
    if(linkedin) profilefields.social.youtube=linkedin;
    if(instagram) profilefields.social.youtube=instagram;
    
    try {
      // Using upsert option (creates new doc if no match is found):
      let profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profilefields },
        { new: true, upsert:true,setDefaultsOnInsert:true}
      );
      return res.json(profile);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server Error');
    }
  }
);

// @route    GET api/profile
// @desc     Get all profiles
// @access   Public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
//Get all profiles
router.get('/',async(req,res)=>{
  try{
    const profiles= await Profile.find().populate('user',['name','avatar'])
    res.send(profiles);
  }
  catch(err){
    console.error(err.message);
    res 
    .status(500)
    .send('Server Error');
  }
})
//Get user by Id
router.get('/user/:user_id', async(req,res)=>{
  try{
    const profile=await (await Profile.findOne({user:req.params.user_id})).populate('user',['name','avatar']);
    if(!profile){
      return res
      .status(400)
      .json(({msg:'Profile is not found'}));
    }
    res.send(profile);
  }
  catch(err){ 
    console.error(err,message);
    if(err.kind=='ObjectId'){
      return res
      .status(400)
      .json(({msg:'Profile is not found'}));
    }
    res
    .status(500)
    .send('Server error');
  }
})
router.delete('/',auth,async(req,res)=>{
  try{
    await Post.deleteMany({user:req.user.id});
  await Profile.findOneAndRemove({user:req.user.id});
  await User.findOneAndRemove({_id:req.user.id});
  res.json({msg:'User deleted'});
  }
  catch(err){
    console.error(err.message);
    res
    .status(500)
    .send('Server Error');
  }
});
// put api/profile/experience
//add exp
// private
router.put(
  '/experience',
  auth,
  check('title', 'Title is required').notEmpty(),
  check('company', 'Company is required').notEmpty(),
  check('from', 'From date is required and needs to be from the past')
    .notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const{
      title,
      company,
      location,
      from,
      to,
      current,
      description
  }= req.body
  const newExp={
    title,
    company,
    location,
    from,
    to,
    current,
    description
  };
    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.experience.unshift(newExp);

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);
//Delete exp from profile

router.delete('/experience/:exp_id',auth,async(req,res)=>{
  try{
  const profile= await Profile.findOne({ user: req.user.id});
  const removeIndex= await profile.experience.map(item=>item.id).indexOf(req.params.exp_id);

  profile.experience.splice(removeIndex,1);
  await profile.save();
  res
  .json(profile);
  }catch(err){
    console.error(err.message);
    res
    .status(500)
    .send('Server error');
  }
});
//Add education
router.put(
  '/education',
  auth,
  check('school', 'School is required').notEmpty(),
  check('degree', 'Degree is required').notEmpty(),
  check('fieldofstudy', 'Field of study is required').notEmpty(),
  check('from', 'From date is required and needs to be from the past')
    .notEmpty(),
    
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const edu ={
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    }=req.body
    const newEdu={
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    }
    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.education.unshift(newEdu);

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);  //delete education 
router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    const foundProfile = await Profile.findOne({ user: req.user.id });
    foundProfile.education = foundProfile.education.filter(
      (edu) => edu._id.toString() !== req.params.edu_id
    );
    await foundProfile.save();
    return res.status(200).json(foundProfile);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'Server error' });
  }
});

  //get github profile
  router.get('/github/:username',(req,res)=>{
    try {
      const options={
        uri:`https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubclientId')}& client_secret=${config.get('githubSecret')}`,
        method:'GET',
        headers:{'user-agent':'node.js'}
      };
      request(options,(error,response,body)=>{
        if(error) console.error;
        if(response.statusCode!=200){
          res
          .status(404)
          .json({msg:'No github profile found'});
        }
        res.json(JSON.parse(body));
      })
    } catch (err) {
      console.error(err.message);
      res
      .status(500)
      .send('server error');  
      
    }
  })
module.exports = router;
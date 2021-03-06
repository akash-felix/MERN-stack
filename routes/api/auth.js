const express = require ('express');
const router=express.Router();
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const config=require('config');
const auth=require('../../middleware/auth');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator');
//sign in process and return token
router.get('/',auth,async (req,res)=>{
    try{
        const user= await User.findById(req.user.id).select('-passowrd');
        return res.json(user);
    }
    catch(err){
        console.error(err);
        res.status(500).send('Server Error');
    }
    });
    router.post(
        '/',
    [
        check('email','Please include a valid email').isEmail(),
        check('password','Password is required').exists()
        ],
        async (req,res)=>{
            const errors=validationResult(req);
            if(!errors.isEmpty()){
                return res.status(400).json({errors:errors.array()});
            }
        const {email,password}= (req.body); 
        try{
            let user=await User.findOne({email});
            if(!user){
                return res
                .status(400)
                .json({errors:[{msg:'Invalid Credentials'}]});
            }
            const isMatched=await bcrypt.compare(password,user.password);
            if(!isMatched){
                return res
                .status(400)
                .json({errors:[{msg:'Invalid Credentials'}]});
            }
            
            const payload={
                user:{
                    id:user.id
                }
            };
            jwt.sign(
                payload,
                config.get('jwtSecret'),
                { expiresIn: 3600 },
                    (err, token) => {
                        if(err) throw err;
                        res.json({token});
                    });
        }
        catch(err){
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
    );

module.exports=router;  
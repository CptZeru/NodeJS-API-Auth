const router = require('express').Router();
const User = require('../model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { registerValidation, loginValidation } = require('./validation');


router.post('/register', async (req, res)=>{
    //validating data
    const {error} = registerValidation(req.body);
    if(error) return res.status(400).send({err: error.details[0].message});

    //Check existing user email in db
    const emailExist = await User.findOne({email: req.body.email});
    if(emailExist) return res.status(400).send({err: "Email already exist"});

    //Hash passwords
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const user = new User ({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
    });
    try{
        const savedUser = await user.save();
        res.send({user: user._id});
    }catch(err){
        res.status(400).send(err);
    }
})

//Login
router.post('/login', async (req, res)=>{
    //validating data
    const {error} = loginValidation(req.body);
    if(error) return res.status(400).send({err: error.details[0].message});

    //Check if user email doesn't exist in db
    const user = await User.findOne({email: req.body.email});
    if(!user) return res.status(400).send({err: "Email or Password is invalid"});
    
    //Check email verification
    const emailVerified = user.isVerified;
    if(!emailVerified) return res.status(400).send({type: "not-verified", err: "Your account hasn't been verified"})

    //Check Password isCorrect
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if(!validPass) return res.status(400).send({err: "Email or Password is invalid"})
    
    //Generate Token
    const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET)
    return res.header('auth-token',token).send({LoggedIn: true, Token: token});
})


module.exports = router;
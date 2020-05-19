const router = require('express').Router();
const verify = require('./verifyToken');

router.get('/', verify,(req,res)=>{
    res.json({
        posts: {
            title: 'Ola ques tas',
            description: 'just a random post'
        }
    });
});

module.exports = router;
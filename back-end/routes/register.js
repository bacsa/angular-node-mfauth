const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const commons = require('./commons');
const router = express.Router();

router.post('/register', async (req, res) => {
    console.log(`DEBUG: Received request to register user`);
    
    commons.userObject.email = req.body.uname;
    commons.userObject.password = req.body.upass;
    // Create a new user
    try {
        const user = new User(commons.userObject)
        await user.save()
        const token = await user.generateAuthToken()

        commons.userObject.token = token;
        delete commons.userObject.tfa;
        
        return res.send({
            "status": 200,
            "message": token
        });
    } catch (error) {
        return res.send({
            "status": 400,
            "message": error
        });
    }
});

module.exports = router;
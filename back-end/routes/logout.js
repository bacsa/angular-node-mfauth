const express = require('express');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const User = require('../models/User');
const auth = require('../middleware/auth');
const commons = require('./commons');
const router = express.Router();

router.post('/logout', async (req, res) => {
    console.log(`DEBUG: Received logout request`);

    //Logout a logged in user
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const user = await User.findByToken(token) 

        if (!user) {
            return res.send({
                "status": 401,
                "message": "Logout failed! Check authentication credentials"
            });
        }else{
            await User.deleteSecret(user._id);
            return res.send({
                "status": 200,
                "message": "User logged out"
            });
        }        
    } catch (error) {
        return res.send({
            "status": 400,
            "message": error
        });
    }

    return res.send({
        "status": 404,
        "message": "I dont know what happend"
    });
});

module.exports = router;
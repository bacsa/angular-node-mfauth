const express = require('express');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const User = require('../models/User');
const auth = require('../middleware/auth');
const commons = require('./commons');
const router = express.Router();

router.post('/login', async (req, res) => {
    console.log(`DEBUG: Received login request`);

    //Login a registered user
    try {
        const email = req.body.uname;
        const password = req.body.upass;
        const user = await User.findByCredentials(email, password)

        if (!user) {
            return res.send({
                "status": 401,
                "message": "Login failed! Check authentication credentials"
            });
        }
        const token = await user.generateAuthToken();

        if (!user.tfa || !user.tfa.secret) {
            const match = await bcrypt.compare(req.body.upass, user.password);

            if(match){
                if (req.body.uname == user.email) {
                    console.log(`DEBUG: #1 Login without TFA is successful`);
    
                    return res.send({
                        "status": 200,
                        "message": token
                    });
                }else{
                    console.log(`ERROR: #2 Login without TFA is not successful`);
    
                    return res.send({
                        "status": 403,
                        "message": "Invalid username or password"
                    });
                } 
            }else{
                return res.send({
                    "status": 403,
                    "message": "Invalid username or password"
                });
            }
        } else {
            const match = await bcrypt.compare(req.body.upass, user.password);
            if(match) {
                if (req.body.uname != user.email) {
                    console.log(`ERROR: #3 Login with TFA is not successful`);
    
                    return res.send({
                        "status": 403,
                        "message": "Invalid username or password"
                    });
                }
                
                if (!req.headers['x-tfa']) {
                    console.log(`WARNING: #4 Login was partial without TFA header`);
    
                    return res.send({
                        "status": 206,
                        "message": "Please enter the Auth Code"
                    });
                }else{
                    let isVerified = speakeasy.totp.verify({
                        secret: user.tfa.secret,
                        encoding: 'base32',
                        token: req.headers['x-tfa']
                    });
        
                    if (isVerified) {
                        console.log(`DEBUG: #5 Login with TFA is verified to be successful`);
        
                        return res.send({
                            "status": 200,
                            "message": token
                        });
                    } else {
                        console.log(`ERROR: Invalid AUTH code`);
        
                        return res.send({
                            "status": 206,
                            "message": "Invalid Auth Code"
                        });
                    }
                }
            }
        }
    } catch (error) {
        return res.send({
            "status": 400,
            "message": error
        });
    }

    return res.send({
        "status": 404,
        "message": "Please register to login"
    });
});

module.exports = router;
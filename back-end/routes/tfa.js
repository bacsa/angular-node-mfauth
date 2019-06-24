const express = require('express');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/User');
const auth = require('../middleware/auth');
const commons = require('./commons');
const router = express.Router();

router.post('/tfa/setup', async (req, res) => {
    console.log(`DEBUG: Received TFA setup request`);

    const token = req.header('Authorization').replace('Bearer ', '')
    const user = await User.findByToken(token)    

    const secret = speakeasy.generateSecret();
    console.log(secret);

    var url = speakeasy.otpauthURL({
        secret: secret.base32,
        label: user.email,
        issuer: process.env.TFA_ISSUER,
        encoding: 'base32'
    });
    QRCode.toDataURL(url, async (err, dataURL) => {
        let tfaArray = {
            secret: '',
            tempSecret: secret.base32,
            dataURL,
            tfaURL: secret.otpauth_url
        };
        await User.updateTFA(user._id, tfaArray);

        return res.json({
            message: 'TFA Auth needs to be verified',
            tempSecret: secret.base32,
            dataURL,
            tfaURL: secret.otpauth_url
        });
    });
});

router.get('/tfa/setup', async (req, res) => {
    console.log(`DEBUG: Received FETCH TFA request`);

    const token = req.header('Authorization').replace('Bearer ', '')
    const user = await User.findByToken(token) 

    res.json(user.tfa ? user.tfa : null);
});

router.get('/tfa/delete', async (req, res) => {
    console.log(`DEBUG: Received DELETE TFA request`);

    const token = req.header('Authorization').replace('Bearer ', '')
    const user = await User.findByToken(token) 

    await User.deleteSecret(user._id);
    res.send({
        "status": 200,
        "message": "success"
    });
});

router.post('/tfa/verify', async (req, res) => {
    console.log(`DEBUG: Received TFA Verify request`);

    const token = req.header('Authorization').replace('Bearer ', '')
    const user = await User.findByToken(token) 

    let isVerified = speakeasy.totp.verify({
        secret: user.tfa.tempSecret,
        encoding: 'base32',
        token: req.body.authcode
    });

    if (isVerified) {
        console.log(`DEBUG: TFA is verified to be enabled`);
        await User.updateSecret(user._id, user.tfa.tempSecret);
        return res.send({
            "status": 200,
            "message": "Two-factor Auth is enabled successfully"
        });
    }

    console.log(`ERROR: TFA is verified to be wrong`);

    return res.send({
        "status": 403,
        "message": "Invalid Auth Code, verification failed. Please verify the system Date and Time"
    });
});

module.exports = router;
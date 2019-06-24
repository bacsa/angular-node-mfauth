const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: value => {
            if (!validator.isEmail(value)) {
                throw new Error({error: 'Invalid Email address'})
            }
        }
    },
    password: {
        type: String,
        required: true,
        minLength: 7
    },
    tfa: {
        type: JSON
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
})

userSchema.pre('save', async function (next) {
    // Hash the password before saving the user model
    const user = this;

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

userSchema.methods.generateAuthToken = async function() {
    // Generate an auth token for the user
    const user = this
    const token = jwt.sign({_id: user._id}, process.env.JWT_KEY, { expiresIn: '1h' })
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

userSchema.statics.findByCredentials = async (email, password) => {
    // Search for a user by email and password.
    const user = await User.findOne({ email } )
    if (!user) {
        throw new Error({ error: 'Invalid login credentials' })
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password)
    if (!isPasswordMatch) {
        throw new Error({ error: 'Invalid login credentials' })
    }
    return user
}

userSchema.statics.findByToken = async (token) => {
    // Search for a user by token
    const user = await User.findOne({ 'tokens.token': token  } )
    return user
}

userSchema.statics.updateTFA = async (userId, tfa) => {
    // Update user TFA
    console.log(userId);
    console.log(tfa);
    const user = await User.updateOne({'_id':userId}, {'tfa': tfa});
}

userSchema.statics.updateSecret = async (userId, secret) => {
    // Update user TFA secret
    const user = await User.updateOne({'_id':userId}, {'tfa.secret': secret});
}

userSchema.statics.deleteSecret = async (userId) => {
    // Update user TFA secret
    const user = await User.updateOne({'_id':userId}, {'tfa.secret': null});
}

const User = mongoose.model('User', userSchema)

module.exports = User
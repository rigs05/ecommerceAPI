const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true,
        unique: true,
    },
    hashPass: {
        type: String,
        required: true,
    },
    userType: {
        type: String,
        required: true,
        // default: null,
    }
});

const UserModel = model('users', userSchema);

module.exports = { UserModel };
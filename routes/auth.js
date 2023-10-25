const express = require('express');
const router = express.Router();
const { UserModel } = require('../database/userSchema');
const { v1 } = require('uuid');
const bcrypt = require('bcrypt');

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, userId, pass, userType } = req.body;
        const userExist = await UserModel.findOne({ userId });
        if (userExist) {
            return res.status(400).send("User already exists in the database.");
        }
        const hashPass = await bcrypt.hash(pass, 10);
        console.log("Hash is: " +hashPass);
        const newUser = new UserModel({ name, userId, hashPass, userType });
        newUser.save();
        res.status(200).json({ message: "Data inserted successfully.", data: newUser });
    } catch (err) {
        res.status(500).json({message: "Internal Server Error", data: err});
    }
})


// Login
router.post('/login', async (req, res) => {
    try {
        const { userId, pass } = req.body;
        const userExist = await UserModel.findOne({ userId });
        if (!userExist) {
            return res.status(400).send("User does not exists in the database. Please register!");
        } else {
            await bcrypt.compare(pass, userExist.hashPass, (err, result) => {
                // console.log(match);
                if (result) {
                    const token = v1();
                    console.log("Token Generated. Token: " + token);
                    return res.status(200).json({ message: "Token generated successfully.", token: token });
                } else {
                    return res.status(401).json({ message: "Invalid Password. Please try again." });
                }
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({message: "Internal Server Error"});
    }
})

module.exports = router;
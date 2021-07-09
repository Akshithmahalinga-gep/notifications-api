const express = require('express'); 
const router = express.Router();
const dbV1 = require('../dbV1/dbV1');

const User = dbV1.User;
const Notification = dbV1.Notification;

router.post('/register-user', async (req, res) => {
    var user = req.body;
    var new_user = new User();
    new_user.username = user.username;
    new_user.password = user.password;
    new_user.email = user.email;
    new_user.usertype = user.usertype;
    var userExists = await User.exists({username: user.username});
    var emailExists = await User.exists({email: user.email});
    var message = "";
    if(userExists == true && emailExists == true) {
        message += "Username and Email already taken";
        res.status(401).send({"message" : message});
    } else if(userExists == true) {
        message += "Username already taken";
        res.status(401).send({"message" : message});
    } else if(emailExists == true) {
        message += "Email already registered";
        res.status(401).send({"message" : message});
    } else {
        var savedUser = await new_user.save();
        res.status(200).send({"message" : "registration successful"});
    }
});

router.post('/login', async(req, res) => {
    var userName = req.body.username;
    var password = req.body.password;
    var user = await User.findOne({username: userName});
    if(user === null) {
        res.status(401).send({"message":"The user doesn't exist. Please Register"})
    } else if(user.password === password) {
        res.status(200).send({
            "message":"Access granted",
            "user_id" : user._id
    });
    } else {
        res.status(401).send({"message" : "Access denied, Please check credentials"});
    }
});

module.exports = router;
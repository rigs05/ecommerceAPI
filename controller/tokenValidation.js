const { version, validate } = require('uuid');

// Verify the token
function tokenValidate(token) {
    return validate(token) && version(token) === 1;
}

const decodeToken = async (req, res, next) => {
    const auth = req.headers.auth;
    if (!auth || !auth.startsWith("token ")) {
        return res.status(401).json({ message: "No token provided." });
    }
    const token = auth.split(' ')[1];
    console.log("the token is: " + token);
    try {
        if (!tokenValidate(token)) {
            return res.json({ message: "The token is expired or invalid, please login again." });
        } else {
            req.token = token;
            next();
        }
    } catch (err) {
        res.send(err);
    }
}

module.exports = decodeToken;
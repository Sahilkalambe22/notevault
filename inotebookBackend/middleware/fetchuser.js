const jwt = require("jsonwebtoken");
const JWT_SECRET = "cannotdoitanymore$22";

const fetchuser = (req, res, next) =>{
    // get user form the authtoken and add id to req obj
    const token = req.header('auth-token');
    if (!token) {
        res.status(401).send({error: "Please use a valid user for authentication"});
    }

    try {
        const data = jwt.verify(token, JWT_SECRET);
    req.user = data.user;
    next();
    } catch (error) {
        res.status(401).send({error: "Please use a valid user for authentication"});
    }
    

}


module.exports = fetchuser;
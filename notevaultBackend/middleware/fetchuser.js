const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
	throw new Error("JWT_SECRET not defined in environment variables");
}

const fetchuser = (req, res, next) => {
	const authHeader = req.header("Authorization");

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res.status(401).json({ error: "Invalid or expired token" });
	}

	const token = authHeader.split(" ")[1];

	try {
		const data = jwt.verify(token, JWT_SECRET);
		req.user = data.user;
		next();
	} catch {
		return res.status(401).json({ error: "Invalid or expired token" });
	}
};

module.exports = fetchuser;

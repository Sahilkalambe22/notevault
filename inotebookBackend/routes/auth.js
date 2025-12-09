const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser");

const JWT_SECRET = "cannotdoitanymore$22";

//route:1, user create with proper conditions,/createuser, no login required

router.post(
	"/createuser",
	[
		body("name", "Enter the valid name").isLength({ min: 3 }),
		body("email", "Enter the valid email").isEmail(),
		body("password", "Password must be of min 4 characters").isLength({min: 4,}),
	],
	async (req, res) => {
		let success = false;
		
		//Error solving and displaying
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ success, errors: errors.array() });
		}
		// check if user is already in datatbase (with email )

		try {
			let user = await User.findOne({ email: req.body.email });
			if (user) {
				return res.status(400).json({success, error: "This mail is already taken" });
			}

			const salt = await bcrypt.genSalt(10);
			const secpass = await bcrypt.hash(req.body.password, salt);
			user = await User.create({
				name: req.body.name,
				email: req.body.email,
				password: secpass,
			});

			const data = {
				user: {
					id: user.id,
				},
			};
			const authtoken = jwt.sign(data, JWT_SECRET);
			success = true;
			res.json({success, authtoken });
		} catch (error) {
			console.error(error.message);
			res.status(500).send("some error occured.");
		}
	}
);

//route:2,user authentication, /login, no login required

router.post(
	"/login",
	[
		body("email", "Enter the valid email").isEmail(),
		body("password", "Password can not be blank").exists(),
	],
	async (req, res) => {
		let success = false;
		//Error solving and displaying

		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		const { email, password } = req.body;
		try {
			let user = await User.findOne({ email });
			if (!user) {
				success = false;
				return res.status(400).json({ success, error: "Enter correct credentials" });
			}
			const passwordCompare = await bcrypt.compare(password, user.password);
			if (!passwordCompare) {
				success = false;
				return res.status(400).json({ success, error: "Enter correct credentials" });
			}
			const data = {
				user: {
					id: user.id,
				},
			};
			const authtoken = jwt.sign(data, JWT_SECRET);
			success = true;
			res.json({success, authtoken, name: user.name });
		} catch (error) {
			console.error(error.message);
			res.status(500).send("Internal Server Error Occured.");
		}
	}
);

//route:3,Get logined user details, /getuser, login required

router.post("/getuser", fetchuser, async (req, res) => {
		try {
			const userId = req.user.id;
			const user = await User.findById(userId).select("-password");
            res.send(user);
		} catch (error) {
			console.error(error.message);
			res.status(500).send("Internal Server Error Occured.");
		}
	}
);

module.exports = router;

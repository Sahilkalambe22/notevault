const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

const User = require("../models/User");
const PendingUser = require("../models/PendingUser");

const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser");
const nodemailer = require("nodemailer");

const JWT_SECRET = process.env.JWT_SECRET;

/* ================= EMAIL TRANSPORTER ================= */

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});

/* ================= RATE LIMITERS ================= */

// Login limiter
const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 5,
	handler: (req, res) => {
		res.status(429).json({
			success: false,
			error: "Too many login attempts. Try again after 15 minutes.",
		});
	},
});

// Signup limiter
const signupLimiter = rateLimit({
	windowMs: 60 * 60 * 1000,
	max: 10,
	handler: (req, res) => {
		res.status(429).json({
			success: false,
			error: "Too many signup attempts. Try again later.",
		});
	},
});

// OTP limiter
const otpLimiter = rateLimit({
	windowMs: 10 * 60 * 1000,
	max: 10,
	handler: (req, res) => {
		res.status(429).json({
			success: false,
			error: "Too many OTP attempts. Please wait.",
		});
	},
});

// Forgot password limiter
const forgotLimiter = rateLimit({
	windowMs: 10 * 60 * 1000,
	max: 3,
	handler: (req, res) => {
		res.status(429).json({
			success: false,
			error: "Too many password reset attempts. Please wait.",
		});
	},
});

/* ================= ROUTE 1: SIGNUP → SEND OTP ================= */

router.post("/createuser", signupLimiter, [body("name", "Enter valid name").isLength({ min: 3 }), body("email", "Enter valid email").isEmail(), body("password", "Password must be min 4 chars").isLength({ min: 4 })], async (req, res) => {
	let success = false;

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ success, errors: errors.array() });
	}

	const { name, email, password } = req.body;

	try {
		const existingUser = await User.findOne({ email });

		if (existingUser) {
			return res.status(400).json({
				success,
				error: "Email already registered",
			});
		}

		await PendingUser.deleteOne({ email });

		const salt = await bcrypt.genSalt(10);
		const secpass = await bcrypt.hash(password, salt);

		const otp = Math.floor(100000 + Math.random() * 900000).toString();
		const hashedOtp = await bcrypt.hash(otp, 10);

		await PendingUser.create({
			name,
			email,
			password: secpass,
			otp: hashedOtp,
			otpExpiry: Date.now() + 10 * 60 * 1000,
		});

		await transporter.sendMail({
			from: process.env.EMAIL_USER,
			to: email,
			subject: "NoteVault OTP Verification",
			html: `
          <h2>NoteVault Verification</h2>
          <p>Your OTP code:</p>
          <h1 style="letter-spacing:4px">${otp}</h1>
          <p>This code expires in 10 minutes.</p>
        `,
		});

		success = true;
		res.json({ success, message: "OTP sent to email" });
	} catch (error) {
		console.error("Signup Error:", error.message);
		res.status(500).json({ success: false, error: "Server error" });
	}
});

/* ================= ROUTE 2: VERIFY OTP ================= */

router.post("/verify-otp", otpLimiter, async (req, res) => {
	const { email, otp } = req.body;
	let success = false;

	try {
		if (!email || !otp) {
			return res.status(400).json({
				success,
				error: "Email and OTP are required",
			});
		}

		const pendingUser = await PendingUser.findOne({ email });

		if (!pendingUser) {
			return res.status(400).json({
				success,
				error: "Signup session expired",
			});
		}

		if (pendingUser.otpExpiry < Date.now()) {
			await PendingUser.deleteOne({ email });
			return res.status(400).json({
				success,
				error: "OTP expired",
			});
		}

		const isMatch = await bcrypt.compare(otp, pendingUser.otp);

		if (!isMatch) {
			return res.status(400).json({
				success,
				error: "Invalid OTP",
			});
		}

		const existingUser = await User.findOne({ email });

		if (existingUser) {
			await PendingUser.deleteOne({ email });
			return res.status(400).json({
				success,
				error: "User already exists",
			});
		}

		const user = await User.create({
			name: pendingUser.name,
			email: pendingUser.email,
			password: pendingUser.password,
		});

		await PendingUser.deleteOne({ email });

		const data = { user: { id: user.id } };

		const authtoken = jwt.sign(data, JWT_SECRET, {
			expiresIn: "7d",
		});

		success = true;

		res.json({
			success,
			authtoken,
			message: "Account verified successfully",
		});
	} catch (error) {
		console.error("Verify OTP Error:", error.message);
		res.status(500).json({ success: false, error: "Server error" });
	}
});

/* ================= ROUTE 3: LOGIN ================= */

router.post("/login", loginLimiter, [body("email", "Enter valid email").isEmail(), body("password", "Password cannot be blank").exists()], async (req, res) => {
	let success = false;

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ success, errors: errors.array() });
	}

	const { email, password } = req.body;

	try {
		const user = await User.findOne({ email });

		const passwordCompare = user ? await bcrypt.compare(password, user.password) : false;

		if (!passwordCompare) {
			return res.status(400).json({
				success,
				error: "Enter correct credentials",
			});
		}

		const data = { user: { id: user.id } };

		const authtoken = jwt.sign(data, JWT_SECRET, {
			expiresIn: "7d",
		});

		success = true;

		res.json({
			success,
			authtoken,
			name: user.name,
		});
	} catch (error) {
		console.error("Login Error:", error.message);
		res.status(500).json({ success: false, error: "Server error" });
	}
});

/* ================= ROUTE 4: GET USER ================= */

router.post("/getuser", fetchuser, async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select("-password");
		res.json(user);
	} catch (error) {
		console.error("GetUser Error:", error.message);
		res.status(500).json({ success: false, error: "Server error" });
	}
});

/* ================= ROUTE 5: UPDATE USER ================= */

router.put("/update", fetchuser, async (req, res) => {
	try {
		const { name, email, password, avatar } = req.body;

		const updateFields = {};

		if (name) updateFields.name = name;
		if (email) updateFields.email = email;

		if (password) {
			const salt = await bcrypt.genSalt(10);
			updateFields.password = await bcrypt.hash(password, salt);
		}

		if (avatar !== undefined) {
			updateFields.avatar = avatar;
		}

		const user = await User.findByIdAndUpdate(req.user.id, { $set: updateFields }, { new: true }).select("-password");

		res.json(user);
	} catch (error) {
		console.error("Update Error:", error.message);
		res.status(500).json({ success: false, error: "Server error" });
	}
});

/* ================= ROUTE 6: FORGOT PASSWORD ================= */

router.post("/forgot-password", forgotLimiter, async (req, res) => {
	const { email } = req.body;

	try {
		const user = await User.findOne({ email });

		if (!user) {
			return res.json({
				success: true,
				message: "If email exists, OTP sent",
			});
		}

		const otp = Math.floor(100000 + Math.random() * 900000).toString();
		const hashedOTP = await bcrypt.hash(otp, 10);

		user.resetOTP = hashedOTP;
		user.resetOTPExpiry = Date.now() + 10 * 60 * 1000;

		await user.save();

		await transporter.sendMail({
			from: process.env.EMAIL_USER,
			to: email,
			subject: "NoteVault Password Reset OTP",
			html: `
        <h2>Password Reset</h2>
        <p>Your OTP:</p>
        <h1 style="letter-spacing:4px">${otp}</h1>
        <p>This code expires in 10 minutes.</p>
      `,
		});

		res.json({ success: true, message: "Reset OTP sent" });
	} catch (error) {
		console.error("Forgot Password Error:", error.message);
		res.status(500).json({ success: false, error: "Server error" });
	}
});

/* ================= ROUTE 7: RESET PASSWORD ================= */

router.post("/reset-password", otpLimiter, async (req, res) => {
	const { email, otp, newPassword } = req.body;

	try {
		const user = await User.findOne({ email });

		if (!user || !user.resetOTP) {
			return res.status(400).json({
				success: false,
				error: "Invalid request",
			});
		}

		if (user.resetOTPExpiry < Date.now()) {
			return res.status(400).json({
				success: false,
				error: "OTP expired",
			});
		}

		const isMatch = await bcrypt.compare(otp, user.resetOTP);

		if (!isMatch) {
			return res.status(400).json({
				success: false,
				error: "Invalid OTP",
			});
		}

		const salt = await bcrypt.genSalt(10);
		user.password = await bcrypt.hash(newPassword, salt);

		user.resetOTP = undefined;
		user.resetOTPExpiry = undefined;

		await user.save();

		res.json({ success: true, message: "Password reset successful" });
	} catch (error) {
		console.error("Reset Password Error:", error.message);
		res.status(500).json({ success: false, error: "Server error" });
	}
});

/* ================= ROUTE 8: REQUEST EMAIL CHANGE ================= */

router.post("/request-email-change", fetchuser, async (req, res) => {
	const { newEmail } = req.body;

	try {
		const existing = await User.findOne({ email: newEmail });

		if (existing) {
			return res.status(400).json({
				success: false,
				error: "Email already in use",
			});
		}

		const otp = Math.floor(100000 + Math.random() * 900000).toString();
		const hashedOtp = await bcrypt.hash(otp, 10);

		const user = await User.findById(req.user.id);

		user.emailChangeOTP = hashedOtp;
		user.emailChangeOTPExpiry = Date.now() + 10 * 60 * 1000;
		user.pendingEmail = newEmail;

		await user.save();

		await transporter.sendMail({
			from: process.env.EMAIL_USER,
			to: newEmail,
			subject: "Verify Email Change",
			html: `
        <h2>Email Change Verification</h2>
        <p>Your OTP:</p>
        <h1 style="letter-spacing:4px">${otp}</h1>
        <p>This code expires in 10 minutes.</p>
      `,
		});

		res.json({
			success: true,
			message: "OTP sent to new email",
		});
	} catch (error) {
		console.error("Email change error:", error.message);
		res.status(500).json({ success: false, error: "Server error" });
	}
});

/* ================= ROUTE 9: VERIFY EMAIL CHANGE ================= */

router.post("/verify-email-change", fetchuser, async (req, res) => {
	const { otp } = req.body;

	try {
		const user = await User.findById(req.user.id);

		if (!user.emailChangeOTP) {
			return res.status(400).json({
				success: false,
				error: "No email change request found",
			});
		}

		if (user.emailChangeOTPExpiry < Date.now()) {
			return res.status(400).json({
				success: false,
				error: "OTP expired",
			});
		}

		const isMatch = await bcrypt.compare(otp, user.emailChangeOTP);

		if (!isMatch) {
			return res.status(400).json({
				success: false,
				error: "Invalid OTP",
			});
		}

		const existing = await User.findOne({ email: user.pendingEmail });

		if (existing) {
			return res.status(400).json({
				success: false,
				error: "Email already in use",
			});
		}

		user.email = user.pendingEmail;

		user.pendingEmail = undefined;
		user.emailChangeOTP = undefined;
		user.emailChangeOTPExpiry = undefined;

		await user.save();

		res.json({
			success: true,
			message: "Email updated successfully",
		});
	} catch (error) {
		console.error("Verify email change error:", error.message);
		res.status(500).json({ success: false, error: "Server error" });
	}
});

module.exports = router;

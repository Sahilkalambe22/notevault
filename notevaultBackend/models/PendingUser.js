const mongoose = require("mongoose");

const PendingUserSchema = new mongoose.Schema({
	name: String,
	email: { type: String, unique: true },
	password: String,
	otp: String,
	otpExpiry: Date,
});

// Auto delete expired OTP records
PendingUserSchema.index({ otpExpiry: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("PendingUser", PendingUserSchema);

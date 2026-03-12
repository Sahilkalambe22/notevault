const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
	},
	password: {
		type: String,
		required: true,
		minlength: 8,
		select: false,
	},
	avatar: {
		type: String,
		default: "",
	},
	resetOTP: String,
	resetOTPExpiry: Date,

	pendingEmail: {
		type: String,
		lowercase: true,
	},

	emailChangeOTP: {
		type: String,
	},

	emailChangeOTPExpiry: {
		type: Date,
	},

	date: {
		type: Date,
		default: Date.now,
	},

	plan: {
		type: String,
		enum: ["free", "pro"],
		default: "free",
	},
});

const User = mongoose.model("User", UserSchema);
module.exports = User;

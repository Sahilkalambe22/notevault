const nodemailer = require("nodemailer");

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
	throw new Error("EMAIL_USER or EMAIL_PASS not defined in environment variables");
}

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});

const sendEmail = async (options) => {
	return transporter.sendMail(options);
};

module.exports = { transporter, sendEmail };

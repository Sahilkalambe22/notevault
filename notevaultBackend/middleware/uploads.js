const path = require("path");
const fs = require("fs");
const multer = require("multer");
const crypto = require("crypto");

const MAX_FILE_SIZE = 15 * 1024 * 1024;

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true });
}

// Allowed file types
const allowedMime = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];

const allowedExt = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf", ".doc", ".docx", ".txt"];

// Storage
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		const now = new Date();

		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, "0");

		const dir = path.join(uploadDir, year.toString(), month);

		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}

		cb(null, dir);
	},

	filename: (req, file, cb) => {
		const ext = path.extname(file.originalname).toLowerCase();

		const uniqueSuffix = crypto.randomBytes(16).toString("hex");

		cb(null, uniqueSuffix + ext);
	},
});

// File validation
const fileFilter = (req, file, cb) => {
	const ext = path.extname(file.originalname).toLowerCase();

	if (!allowedExt.includes(ext)) {
		return cb(new Error("Invalid file extension"), false);
	}

	if (!allowedMime.includes(file.mimetype)) {
		return cb(new Error("Invalid file type"), false);
	}

	cb(null, true);
};

const upload = multer({
	storage,
	fileFilter,
	limits: {
		fileSize: MAX_FILE_SIZE,
		files: 4,
	},
});

module.exports = upload;

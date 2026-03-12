const path = require("path");
const fs = require("fs");
const multer = require("multer");

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// ================================
// Ensure uploads directory exists
// ================================
const uploadDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true });
}

// ================================
// Allowed file types
// ================================
const allowedMime = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain", "application/zip"];

const allowedExt = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf", ".doc", ".docx", ".txt", ".zip"];

// ================================
// Storage configuration
// ================================
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, uploadDir);
	},

	filename: function (req, file, cb) {
		const safeName = path.basename(file.originalname); // prevents path traversal

		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

		const ext = path.extname(safeName).toLowerCase();

		cb(null, uniqueSuffix + ext);
	},
});

// ================================
// File validation
// ================================
const fileFilter = (req, file, cb) => {
	const ext = path.extname(file.originalname).toLowerCase();

	if (allowedMime.includes(file.mimetype) && allowedExt.includes(ext)) {
		cb(null, true);
	} else {
		cb(new Error("Unsupported file type"), false);
	}
};

// ================================
// Multer upload middleware
// ================================
const upload = multer({
	storage,
	fileFilter,
	limits: {
		fileSize: MAX_FILE_SIZE,
		files: 5, // limit number of files per request
	},
});

module.exports = upload;

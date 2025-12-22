// routes/ocr.js
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { recognize } = require("tesseract.js"); // use recognize instead of createWorker

const router = express.Router();

// Folder where OCR images will be stored temporarily
const OCR_DIR = path.join(__dirname, "..", "ExtractionUploads");

// Ensure the OCR directory exists
if (!fs.existsSync(OCR_DIR)) {
	fs.mkdirSync(OCR_DIR, { recursive: true });
	console.log("Created ExtractionUploads directory:", OCR_DIR);
}

// Multer storage for OCR uploads ONLY
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, OCR_DIR);
	},
	filename: function (req, file, cb) {
		const ext = path.extname(file.originalname) || ".jpg";
		const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
		cb(null, filename);
	},
});

// Allowed image types
function fileFilter(req, file, cb) {
	const allowed = ["image/jpeg", "image/png", "image/webp", "image/bmp"];
	if (!allowed.includes(file.mimetype)) {
		return cb(new Error("Only JPG, PNG, WEBP, BMP allowed"));
	}
	cb(null, true);
}

const upload = multer({
	storage,
	fileFilter,
	limits: { fileSize: 6 * 1024 * 1024 }, // 6MB
}).single("image");

// Helper to delete temp OCR image
function safeDelete(file) {
	fs.unlink(file, (err) => {
		if (err && err.code !== "ENOENT") {
			console.warn("Failed to delete:", file, err.message);
		}
	});
}

// helper to build a short debug response for clients (and also log full error on server)
function respondOcrError(res, stage, err) {
	console.error(`[OCR][${stage}]`, err && (err.message || err));
	// return concise message to client and put details in server log
	return res.status(500).json({
		error: "OCR failed",
		stage,
		message: err && err.message ? err.message : String(err),
	});
}

// POST /api/notes/ocr
router.post("/", (req, res) => {
	upload(req, res, async function (err) {
		if (err) {
			console.error("[OCR] upload error:", err);
			return res.status(400).json({ error: "Upload error", message: err.message });
		}

		if (!req.file) return res.status(400).json({ error: "No image uploaded" });

		const filePath = req.file.path;

		try {
			console.log("[OCR] starting recognize() for:", filePath);

			// If you need a language other than 'eng', change the second arg.
			// recognize() will fetch tessdata automatically from the default CDN if needed.
			const result = await recognize(filePath, "eng");

			// result.data.text contains extracted text
			const text = result && result.data ? result.data.text || "" : "";

			console.log("[OCR] recognition completed, length:", text.length);

			safeDelete(filePath);

			return res.json({ text });
		} catch (e) {
			return respondOcrError(res, "processing", e);
		} finally {
			// ensure cleanup
			safeDelete(filePath);
		}
	});
});

module.exports = router;

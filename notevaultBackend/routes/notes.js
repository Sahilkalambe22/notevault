const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const fetchuser = require("../middleware/fetchuser");
const upload = require("../middleware/uploads");
const rateLimit = require("express-rate-limit");

const { fetchAllNotes, searchNotes, addNote, updateNote, deleteNote, getNoteVersions, restoreVersion, deleteAttachment, uploadInlineImage, getUsage, shareNote, getPublicNote } = require("../controllers/notesController");

const { body } = require("express-validator");

const notesLimiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 minute
	max: 120, // 120 requests per minute per IP
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		error: "Too many requests. Please slow down.",
	},
});

/* ===============================
   Public share limiter
=============================== */

const publicShareLimiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 30, // 30 requests per minute
	standardHeaders: true,
	legacyHeaders: false,
	handler: (req, res) => {
		res.status(429).json({
			error: "Too many requests. Please slow down.",
		});
	},
});

router.use(notesLimiter);

/* ===============================
   ObjectId validator
=============================== */

const validateObjectId = (paramName = "id") => {
	return (req, res, next) => {
		const value = req.params[paramName];

		if (!value || !mongoose.Types.ObjectId.isValid(value)) {
			return res.status(400).json({ error: `Invalid ${paramName}` });
		}

		next();
	};
};

/* ===============================
   ROUTES
=============================== */

router.get("/fetchallnotes", fetchuser, fetchAllNotes);

router.get("/search", fetchuser, searchNotes);

router.post("/addnotes", fetchuser, upload.fields([{ name: "attachments" }]), [body("title").trim().isLength({ min: 3, max: 200 }).withMessage("Title must be 1–200 characters"), body("description").isLength({ min: 5, max: 50000 }).withMessage("Description must be 5–50,000 characters"), body("tag").optional().trim().isLength({ max: 50 })], addNote);

router.put("/updatenote/:id", fetchuser, validateObjectId("id"), upload.fields([{ name: "attachments" }]), updateNote);

router.delete("/deletenote/:id", fetchuser, validateObjectId("id"), deleteNote);

router.get("/:id/versions", fetchuser, validateObjectId("id"), getNoteVersions);

router.post("/:noteId/restore/:versionId", fetchuser, validateObjectId("noteId"), validateObjectId("versionId"), restoreVersion);

router.delete("/:id/attachments/:index", fetchuser, validateObjectId("id"), deleteAttachment);

router.post("/:id/upload-inline-image", fetchuser, validateObjectId("id"), upload.single("image"), uploadInlineImage);

router.get("/usage", fetchuser, getUsage);

router.post("/:id/share", fetchuser, validateObjectId("id"), shareNote);

router.get("/public/:shareId", publicShareLimiter, getPublicNote);

module.exports = router;

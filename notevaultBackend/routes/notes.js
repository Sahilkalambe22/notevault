const express = require("express");
const router = express.Router();
const crypto = require("crypto");

const Note = require("../models/Note");
const NoteVersion = require("../models/NoteVersion");
const User = require("../models/User");
const fetchuser = require("../middleware/fetchuser");
const upload = require("../middleware/uploads");
const pruneNoteVersions = require("../utils/pruneNoteVersions");
const PLAN_LIMITS = require("../utils/planLimits");
const cleanupUploads = require("../utils/cleanupUploads");
const scanFile = require("../utils/scanFile");
const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");
const hostf = process.env.FRONTEND_URL || "http://localhost:3000";
const fs = require("fs");
const path = require("path");


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

/* =====================================================
   ROUTE 1: FETCH ALL NOTES
===================================================== */

router.get("/fetchallnotes", fetchuser, async (req, res) => {
	try {
		// page number from query
		const page = parseInt(req.query.page) || 1;

		// how many notes per request
		const limit = 20;

		// skip previous pages
		const skip = (page - 1) * limit;

		const notes = await Note.find({ user: req.user.id }).sort({ isPinned: -1, date: -1 }).skip(skip).limit(limit).lean();

		// total notes count
		const total = await Note.countDocuments({ user: req.user.id });

		res.json({
			notes,
			page,
			total,
			hasMore: skip + notes.length < total,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Server error occurred." });
	}
});

/* ===================================================== ROUTE 1B: SEARCH NOTES ===================================================== */
router.get("/search", fetchuser, async (req, res) => {
	try {
		const query = req.query.q;
		if (!query || !query.trim()) {
			return res.json({ notes: [] });
		}
		const notes = await Note.find({ user: req.user.id, $text: { $search: query } })
			.sort({ isPinned: -1, date: -1 })
			.limit(20)
			.lean();
		res.json({ notes });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Search failed" });
	}
});

/* =====================================================
   ROUTE 2: ADD NOTE
===================================================== */

router.post("/addnotes", fetchuser, upload.fields([{ name: "attachments", maxCount: 5 }]), [body("title").trim().isLength({ min: 1, max: 200 }).withMessage("Title must be 1–200 characters"), body("description").isLength({ min: 1, max: 50000 }).withMessage("Description too long"), body("tag").optional().trim().isLength({ max: 50 })], async (req, res) => {
	try {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			cleanupUploads(req.files?.attachments);

			return res.status(400).json({ errors: errors.array() });
		}

		const { title, description, tag, reminderAt } = req.body;

		const attachmentFiles = req.files?.attachments || [];


		for (const file of attachmentFiles) {
			try {
				await scanFile(file.path);
			} catch (err) {
				fs.unlinkSync(file.path);

				return res.status(400).json({
					error: "File failed malware scan",
				});
			}
		}

		const user = await User.findById(req.user.id);

		const noteCount = await Note.countDocuments({ user: req.user.id });

		const limit = PLAN_LIMITS[user.plan].notes;

		if (noteCount >= limit) {
			cleanupUploads(req.files?.attachments);

			return res.status(403).json({
				error: "Note limit reached. Upgrade to Pro Plan.",
			});
		}

		const note = new Note({
			title,
			description,
			tag,
			user: req.user.id,
			attachments: attachmentFiles.map((file) => ({
				path: `/uploads/${file.filename}`,
				originalName: file.originalname,
				mimeType: file.mimetype,
				size: file.size,
			})),
			reminderAt: reminderAt ? new Date(reminderAt) : null,
			reminderSent: false,
		});

		const savedNote = await note.save();

		/* Initial version snapshot */
		try {
			await NoteVersion.create({
				note: savedNote._id,
				user: req.user.id,
				title: savedNote.title,
				description: savedNote.description,
				tag: savedNote.tag,
				attachments: savedNote.attachments,
				isPinned: savedNote.isPinned,
				reminderAt: savedNote.reminderAt,
				comment: "Initial version",
			});

			pruneNoteVersions(savedNote._id, 10);
		} catch (err) {
			console.error("Initial version error:", err);
		}

		res.json(savedNote);
	} catch (err) {
		cleanupUploads(req.files?.attachments);
		console.error(err);
		res.status(500).json({ error: "Server error occurred." });
	}
});

/* =====================================================
   ROUTE 3: UPDATE NOTE
===================================================== */

router.put("/updatenote/:id", fetchuser, validateObjectId("id"), upload.fields([{ name: "attachments", maxCount: 5 }]), async (req, res) => {
	try {
		const note = await Note.findById(req.params.id);

		if (!note) return res.status(404).json({ error: "Note not found" });

		if (note.user.toString() !== req.user.id) {
			return res.status(403).json({ error: "Not allowed" });
		}

		/* Save version before updating */
		try {
			await NoteVersion.create({
				note: note._id,
				user: req.user.id,
				title: note.title,
				description: note.description,
				tag: note.tag,
				attachments: note.attachments,
				isPinned: note.isPinned,
				reminderAt: note.reminderAt,
				comment: "Before update",
			});

			pruneNoteVersions(note._id, 10);
		} catch (err) {
			console.error("Version snapshot error:", err);
		}

		/* Attachments */
		const attachmentFiles = req.files?.attachments || [];

    for (const file of attachmentFiles) {
  try {
    await scanFile(file.path);
  } catch (err) {

    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    return res.status(400).json({
      error: "File failed malware scan",
    });
  }
}

		if (attachmentFiles.length > 0) {
			note.attachments.push(
				...attachmentFiles.map((file) => ({
					path: `/uploads/${file.filename}`,
					originalName: file.originalname,
					mimeType: file.mimetype,
					size: file.size,
				})),
			);
		}

		/* Safe updates */
		const allowedFields = ["title", "description", "tag", "reminderAt", "isPinned"];

		allowedFields.forEach((field) => {
			if (req.body[field] !== undefined) {
				if (field === "reminderAt") {
					const val = req.body.reminderAt;

					note.reminderAt = val === "" || val === null || val === "null" ? null : new Date(val);

					note.reminderSent = false;
				} else {
					note[field] = req.body[field];
				}
			}
		});

		await note.save();

		res.json(note);
	} catch (err) {

  cleanupUploads(req.files?.attachments);

  console.error("Update note error:", err);

  res.status(500).json({ error: "Server error occurred." });

}
});

/* =====================================================
   ROUTE 4: DELETE NOTE
===================================================== */

router.delete("/deletenote/:id", fetchuser, validateObjectId("id"), async (req, res) => {
	try {
		const note = await Note.findById(req.params.id);

		if (!note) return res.status(404).json({ error: "Note not found" });

		if (note.user.toString() !== req.user.id) {
			return res.status(403).json({ error: "Not allowed" });
		}


		// delete attachments from disk
		for (const attachment of note.attachments) {
			const filePath = path.join(__dirname, "..", attachment.path.replace(/^\/+/, ""));

			try {
				if (fs.existsSync(filePath)) {
					fs.unlinkSync(filePath);
				}
			} catch (err) {
				console.error("Failed to delete file:", filePath);
			}
		}

		await Note.findByIdAndDelete(req.params.id);
		await NoteVersion.deleteMany({ note: req.params.id });

		res.json({ success: true });
	} catch (err) {
		console.error(err);

		res.status(500).json({ error: "Server error occurred." });
	}
});

/* =====================================================
   ROUTE 5: GET NOTE VERSIONS
===================================================== */

router.get("/:id/versions", fetchuser, validateObjectId("id"), async (req, res) => {
	try {
		const note = await Note.findById(req.params.id);

		if (!note) return res.status(404).json({ error: "Note not found" });

		if (note.user.toString() !== req.user.id) {
			return res.status(403).json({ error: "Not allowed" });
		}

		const versions = await NoteVersion.find({ note: req.params.id }).sort({ savedAt: -1 }).lean();

		res.json(versions);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Server error occurred." });
	}
});

/* =====================================================
   ROUTE 6: RESTORE VERSION
===================================================== */

router.post("/:noteId/restore/:versionId", fetchuser, validateObjectId("noteId"), validateObjectId("versionId"), async (req, res) => {
	try {
		const { noteId, versionId } = req.params;

		const note = await Note.findById(noteId);
		const version = await NoteVersion.findById(versionId);

		if (!note || !version) return res.status(404).json({ error: "Note or version not found" });

		if (note.user.toString() !== req.user.id) return res.status(403).json({ error: "Not allowed" });

		if (version.note.toString() !== noteId) return res.status(400).json({ error: "Version mismatch" });

		await NoteVersion.create({
			note: note._id,
			user: req.user.id,
			title: note.title,
			description: note.description,
			tag: note.tag,
			attachments: note.attachments,
			isPinned: note.isPinned,
			reminderAt: note.reminderAt,
			comment: "Backup before restore",
		});

		pruneNoteVersions(note._id, 10);

		Object.assign(note, {
			title: version.title,
			description: version.description,
			tag: version.tag,
			attachments: version.attachments,
			isPinned: version.isPinned,
			reminderAt: version.reminderAt,
		});

		await note.save();

		res.json({ success: true, note });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Server error occurred." });
	}
});

/* =====================================================
   ROUTE 7: DELETE ATTACHMENT
===================================================== */

router.delete("/:id/attachments/:index", fetchuser, validateObjectId("id"), async (req, res) => {
	try {
		const { id, index } = req.params;

		const note = await Note.findById(id);

		if (!note) return res.status(404).json({ error: "Note not found" });

		if (note.user.toString() !== req.user.id) return res.status(403).json({ error: "Not allowed" });

		const idx = Number(index);

		if (Number.isNaN(idx) || idx < 0 || idx >= note.attachments.length) {
			return res.status(400).json({ error: "Invalid attachment index" });
		}


		const attachment = note.attachments[idx];

		const filePath = path.join(__dirname, "..", attachment.path.replace(/^\/+/, ""));

		try {
			if (fs.existsSync(filePath)) {
				fs.unlinkSync(filePath);
			}
		} catch (err) {
			console.error("Failed to delete attachment:", filePath);
		}

		note.attachments.splice(idx, 1);

		await note.save();

		res.json(note);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Server error occurred." });
	}
});

/* =====================================================
   ROUTE 8: UPLOAD INLINE IMAGE
===================================================== */

router.post("/:id/upload-inline-image", fetchuser, validateObjectId("id"), upload.single("image"), async (req, res) => {
	try {
		const note = await Note.findById(req.params.id);

		if (!note) return res.status(404).json({ error: "Note not found" });

		if (note.user.toString() !== req.user.id) return res.status(403).json({ error: "Not allowed" });

		if (!req.file) {
			return res.status(400).json({ error: "No image uploaded" });
		}


		try {
			await scanFile(req.file.path);
		} catch (scanErr) {
			if (fs.existsSync(req.file.path)) {
				fs.unlinkSync(req.file.path);
			}

			return res.status(400).json({
				error: "File failed malware scan",
			});
		}

		const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

		res.json({ imageUrl });
	} catch (err) {

		if (req.file && fs.existsSync(req.file.path)) {
			fs.unlinkSync(req.file.path);
		}

		console.error("Inline image upload error:", err);

		res.status(500).json({ error: "Server error occurred." });
	}
});

// =========================
// ROUTE 9:GET NOTES USAGE
// =========================
router.get("/usage", fetchuser, async (req, res) => {
	try {
		const used = await Note.countDocuments({ user: req.user.id });

		const user = await User.findById(req.user.id);

		const limit = PLAN_LIMITS[user.plan].notes;

		res.json({
			used,
			limit,
			remaining: limit === Infinity ? null : limit - used,
			plan: user.plan,
		});
	} catch (error) {
		console.error(error);
		res.status(500).send("Server Error");
	}
});

/* =====================================================
   ROUTE 10: SHARE NOTE
===================================================== */

router.post("/:id/share", fetchuser, validateObjectId("id"), async (req, res) => {
	try {
		const note = await Note.findById(req.params.id);

		if (!note) return res.status(404).json({ error: "Note not found" });

		if (note.user.toString() !== req.user.id) {
			return res.status(403).json({ error: "Not allowed" });
		}

		if (!note.shareId) {
			note.shareId = crypto.randomBytes(12).toString("hex");
		}

		note.isPublic = true;

		await note.save();

		res.json({
			shareUrl: `${hostf}/share/${note.shareId}`,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Server error" });
	}
});

/* =====================================================
   ROUTE 11: GET PUBLIC NOTE
===================================================== */

router.get("/public/:shareId", async (req, res) => {
	try {
		const note = await Note.findOne({
			shareId: req.params.shareId,
			isPublic: true,
		}).lean();

		if (!note) {
			return res.status(404).json({ error: "Note not found" });
		}

		res.json({
			title: note.title,
			description: note.description,
			tag: note.tag,
			date: note.date,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Server error" });
	}
});

module.exports = router;

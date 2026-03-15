const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { validationResult } = require("express-validator");

const Note = require("../models/Note");
const NoteVersion = require("../models/NoteVersion");
const User = require("../models/User");

const pruneNoteVersions = require("../utils/pruneNoteVersions");
const PLAN_LIMITS = require("../utils/planLimits");
const cleanupUploads = require("../utils/cleanupUploads");
const scanFile = require("../utils/scanFile");

const hostf = process.env.FRONTEND_URL || "http://localhost:3000";

/* ===============================
   FETCH ALL NOTES
=============================== */

exports.fetchAllNotes = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = 20;
		const skip = (page - 1) * limit;

		const notes = await Note.find({ user: req.user.id }).sort({ isPinned: -1, date: -1 }).skip(skip).limit(limit).lean();

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
};

/* ===============================
   SEARCH NOTES
=============================== */

exports.searchNotes = async (req, res) => {
	try {
		const query = req.query.q;

		if (!query || !query.trim()) {
			return res.json({ notes: [] });
		}

		const escapeRegex = (text) =>
			text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

		const regex = new RegExp(escapeRegex(query), "i");

		const notes = await Note.find({
			user: req.user.id,
			$or: [
				{ title: regex },
				{ description: regex },
				{ tag: regex },
			],
		})
			.sort({ isPinned: -1, date: -1 })
			.limit(20)
			.lean();

		res.json({ notes });

	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Search failed" });
	}
};
/* ===============================
   ADD NOTE
=============================== */

exports.addNote = async (req, res) => {
	try {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			cleanupUploads(req.files?.attachments);
			return res.status(400).json({ errors: errors.array() });
		}

		const { title, description, tag, reminderAt } = req.body;

		const user = await User.findById(req.user.id);

		const attachmentFiles = req.files?.attachments || [];

		const userNotes = await Note.find({ user: req.user.id }, "attachments");

		let usedStorage = 0;

		userNotes.forEach((n) => {
			n.attachments.forEach((a) => {
				usedStorage += a.size || 0;
			});
		});

		// size of uploaded files
		const newUploadSize = attachmentFiles.reduce((total, file) => {
			return total + file.size;
		}, 0);

		const storageLimit = PLAN_LIMITS[user.plan].storage;

		if (usedStorage + newUploadSize > storageLimit) {
			cleanupUploads(req.files?.attachments);

			return res.status(403).json({
				error: "Storage limit exceeded for your plan",
			});
		}

		const planLimit = PLAN_LIMITS[user.plan]?.attachments || 0;

		if (attachmentFiles.length > planLimit) {
			cleanupUploads(req.files?.attachments);

			return res.status(403).json({
				error: `Attachment limit reached for ${user.plan} plan`,
			});
		}

		// virus scan
		for (const file of attachmentFiles) {
			try {
				await scanFile(file.path);
			} catch (err) {
				console.error("Virus scan failed:", err.message);

				if (fs.existsSync(file.path)) {
					fs.unlinkSync(file.path);
				}

				cleanupUploads(req.files?.attachments);

				return res.status(400).json({
					error: "File failed malware scan",
				});
			}
		}

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
};

/* ===============================
   UPDATE NOTE
=============================== */

exports.updateNote = async (req, res) => {
	try {
		const note = await Note.findById(req.params.id);

		if (!note) {
			cleanupUploads(req.files?.attachments);
			return res.status(404).json({ error: "Note not found" });
		}

		if (note.user.toString() !== req.user.id) {
			cleanupUploads(req.files?.attachments);
			return res.status(403).json({ error: "Not allowed" });
		}

		const user = await User.findById(req.user.id);

		const attachmentFiles = req.files?.attachments || [];

	/* ===============================
       VERSION SNAPSHOT
    =============================== */

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

	/* ===============================
       STORAGE CALCULATION
    =============================== */

		const userNotes = await Note.find({ user: req.user.id, _id: { $ne: note._id } }, "attachments");

		let usedStorage = 0;

		userNotes.forEach((n) => {
			n.attachments.forEach((a) => {
				usedStorage += a.size || 0;
			});
		});

		const newUploadSize = attachmentFiles.reduce((total, file) => {
			return total + file.size;
		}, 0);

		const storageLimit = PLAN_LIMITS[user.plan].storage;

		if (usedStorage + newUploadSize > storageLimit) {
			cleanupUploads(req.files?.attachments);

			return res.status(403).json({
				error: "Storage limit exceeded for your plan",
			});
		}

	/* ===============================
       ATTACHMENT LIMIT
    =============================== */

		const planLimit = PLAN_LIMITS[user.plan]?.attachments || 0;

		if (note.attachments.length + attachmentFiles.length > planLimit) {
			cleanupUploads(req.files?.attachments);

			return res.status(403).json({
				error: `Attachment limit reached for ${user.plan} plan`,
			});
		}

	/* ===============================
       VIRUS SCAN
    =============================== */

		for (const file of attachmentFiles) {
			try {
				await scanFile(file.path);
			} catch (err) {
				console.error("Virus scan failed:", err.message);

				if (fs.existsSync(file.path)) {
					fs.unlinkSync(file.path);
				}

				cleanupUploads(req.files?.attachments);

				return res.status(400).json({
					error: "File failed malware scan",
				});
			}
		}

	/* ===============================
       ADD NEW ATTACHMENTS
    =============================== */

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

	/* ===============================
       ALLOWED FIELD UPDATES
    =============================== */

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

		/* ===============================
       SAVE NOTE
    =============================== */

	const updatedNote = await note.save();

		res.json(updatedNote);
	} catch (err) {
		cleanupUploads(req.files?.attachments);

		console.error(err);

		res.status(500).json({
			error: "Server error occurred.",
		});
	}
};

/* ===============================
   DELETE NOTE
=============================== */

exports.deleteNote = async (req, res) => {
	try {
		const note = await Note.findById(req.params.id);

		if (!note) return res.status(404).json({ error: "Note not found" });

		if (note.user.toString() !== req.user.id) return res.status(403).json({ error: "Not allowed" });

		const uploadsDir = path.join(__dirname, "../uploads");

		for (const attachment of note.attachments) {
			const filePath = path.join(uploadsDir, path.basename(attachment.path));

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
};

/* ===============================
   GET NOTE VERSIONS
=============================== */

exports.getNoteVersions = async (req, res) => {
	try {
		const note = await Note.findById(req.params.id);

		if (!note) return res.status(404).json({ error: "Note not found" });

		if (note.user.toString() !== req.user.id) return res.status(403).json({ error: "Not allowed" });

		const versions = await NoteVersion.find({ note: req.params.id }).sort({ savedAt: -1 }).lean();

		res.json(versions);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Server error occurred." });
	}
};

/* ===============================
   RESTORE VERSION
=============================== */

exports.restoreVersion = async (req, res) => {
	try {
		const { noteId, versionId } = req.params;

		const note = await Note.findById(noteId);
		const version = await NoteVersion.findById(versionId);

		if (!note || !version)
			return res.status(404).json({
				error: "Note or version not found",
			});

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
};

/* ===============================
   DELETE ATTACHMENT
=============================== */

exports.deleteAttachment = async (req, res) => {
	try {
		const { id, index } = req.params;

		const note = await Note.findById(id);

		if (!note) return res.status(404).json({ error: "Note not found" });

		if (note.user.toString() !== req.user.id) return res.status(403).json({ error: "Not allowed" });

		const idx = Number(index);

		if (Number.isNaN(idx) || idx < 0 || idx >= note.attachments.length) {
			return res.status(400).json({
				error: "Invalid attachment index",
			});
		}

		const attachment = note.attachments[idx];

		const uploadsDir = path.join(__dirname, "../uploads");
		const filePath = path.join(uploadsDir, path.basename(attachment.path));

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
};

/* ===============================
   INLINE IMAGE UPLOAD
=============================== */

exports.uploadInlineImage = async (req, res) => {
	try {
		const note = await Note.findById(req.params.id);

		if (!note) return res.status(404).json({ error: "Note not found" });

		if (note.user.toString() !== req.user.id) return res.status(403).json({ error: "Not allowed" });

		if (!req.file) return res.status(400).json({ error: "No image uploaded" });

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
};

/* ===============================
   USAGE
=============================== */

exports.getUsage = async (req, res) => {
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
	} catch (err) {
		console.error(err);
		res.status(500).send("Server Error");
	}
};

/* ===============================
   SHARE NOTE
=============================== */

exports.shareNote = async (req, res) => {
	try {
		const note = await Note.findById(req.params.id);

		if (!note) return res.status(404).json({ error: "Note not found" });

		if (note.user.toString() !== req.user.id) return res.status(403).json({ error: "Not allowed" });

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
};

/* ===============================
   PUBLIC NOTE
=============================== */

exports.getPublicNote = async (req, res) => {
	try {
		const note = await Note.findOne({
			shareId: req.params.shareId,
			isPublic: true,
		}).lean();

		if (!note) return res.status(404).json({ error: "Note not found" });

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
};

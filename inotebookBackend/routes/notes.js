const express = require("express");
const router = express.Router();

const notes = require("../models/Note");
const NoteVersion = require("../models/NoteVersion");
const fetchuser = require("../middleware/fetchuser");
const upload = require("../middleware/uploads");

const pruneNoteVersions = require("../utils/pruneNoteVersions");

const { body, validationResult } = require("express-validator");

// -------------------------
// route1: get all the notes.
// GET http://localhost:5000/api/notes/fetchallnotes
// -------------------------
router.get("/fetchallnotes", fetchuser, async (req, res) => {
	try {
		const note = await notes.find({ user: req.user.id }).sort({ isPinned: -1, date: -1 });
		res.json(note);
	} catch (error) {
		console.error(error.message);
		res.status(500).send("Server error occured.");
	}
});

// -------------------------
// route2: Add new notes.
// POST http://localhost:5000/api/notes/addnotes
// -------------------------
router.post(
	"/addnotes",
	fetchuser,
	upload.fields([
		{ name: "image", maxCount: 1 }, // 1 image max
		{ name: "attachments", maxCount: 3 }, // up to 3 attachments
	]),
	[
		body("title", "Enter the valid Title").isLength({ min: 3 }),
		body("description", "Description must be of min 10 characters").isLength({
			min: 10,
		}),
	],
	async (req, res) => {
		try {
			// 🔹 Run validations
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			}

			const { title, description, tag, reminderAt } = req.body;

			// 🔹 Handle optional image
			const imageFile = req.files?.image?.[0];
			let imagePath, imageOriginalName;

			if (imageFile) {
				imagePath = `/uploads/${imageFile.filename}`;
				imageOriginalName = imageFile.originalname;
			}

			// 🔹 Handle optional attachments array
			const attachmentFiles = req.files?.attachments || [];
			const attachments = attachmentFiles.map((file) => ({
				path: `/uploads/${file.filename}`,
				originalName: file.originalname,
				mimeType: file.mimetype,
				size: file.size,
			}));

			// 🔹 Create note document (with optional reminderAt)
			const note = new notes({
				title,
				description,
				tag,
				user: req.user.id,
				imagePath,
				imageOriginalName,
				attachments,
				reminderAt: reminderAt ? new Date(reminderAt) : null,
			});

			const saveNote = await note.save();

			// OPTIONAL: create initial version snapshot (non-blocking)
			try {
				await NoteVersion.create({
					note: saveNote._id,
					user: req.user.id,
					title: saveNote.title,
					description: saveNote.description,
					tag: saveNote.tag,
					imagePath: saveNote.imagePath,
					imageOriginalName: saveNote.imageOriginalName,
					attachments: saveNote.attachments,
					isPinned: saveNote.isPinned,
					reminderAt: saveNote.reminderAt,
					comment: "Initial version",
				});
				// prune if needed
				pruneNoteVersions(saveNote._id, 10);
			} catch (verErr) {
				console.error("Failed to create initial version:", verErr);
				// do not block note creation on version failure
			}

			res.json(saveNote);
		} catch (error) {
			console.error(error.message);
			res.status(500).send("Server error occured.");
		}
	}
);

// -------------------------
// route3: update notes.
// PUT http://localhost:5000/api/notes/updatenote/:id
// -------------------------
router.put("/updatenote/:id", fetchuser, async (req, res) => {
	try {
		// Find the note
		let note = await notes.findById(req.params.id);
		if (!note) {
			return res.status(404).send("Note not found");
		}

		// Check ownership
		if (note.user.toString() !== req.user.id) {
			return res.status(401).send("Not allowed");
		}

		// --- Create a version BEFORE updating ---
		try {
			await NoteVersion.create({
				note: note._id,
				user: req.user.id,
				title: note.title,
				description: note.description,
				tag: note.tag,
				imagePath: note.imagePath,
				imageOriginalName: note.imageOriginalName,
				attachments: note.attachments,
				isPinned: note.isPinned,
				reminderAt: note.reminderAt,
				comment: "Before update",
			});
			// prune to last 10 versions (adjust as needed)
			pruneNoteVersions(note._id, 10);
		} catch (verErr) {
			console.error("Error creating version before update:", verErr);
			// continue even if version fails
		}

		// ⭐ Allow partial update — any fields sent in req.body
		const newNote = {};

		for (let key in req.body) {
			if (key === "reminderAt") {
				const value = req.body.reminderAt;
				if (value === "" || value === null || value === undefined) {
					// clear reminder
					newNote.reminderAt = null;
				} else {
					newNote.reminderAt = new Date(value);
				}
			} else {
				newNote[key] = req.body[key];
			}
		}

		// Update note
		note = await notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });

		res.json(note);
	} catch (error) {
		console.error(error.message);
		res.status(500).send("Server error occurred.");
	}
});

// -------------------------
// route4: delete notes.
// DELETE http://localhost:5000/api/notes/deletenote/:id
// -------------------------
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
	try {
		// find the note to be delete and delete it
		let note = await notes.findById(req.params.id);
		if (!note) {
			return res.status(404).send("note not found");
		}

		// allow deletion only if note belongs to the user
		if (note.user.toString() !== req.user.id) {
			return res.status(401).send("Not allowed");
		}

		note = await notes.findByIdAndDelete(req.params.id);

		// optional: also delete versions for this note
		try {
			await NoteVersion.deleteMany({ note: req.params.id });
		} catch (err) {
			console.error("Failed to delete versions after note delete:", err);
		}

		res.json({ success: "note is deleted succesfully" });
	} catch (error) {
		console.error(error.message);
		res.status(500).send("Server error occured.");
	}
});

// -------------------------
// NEW: GET versions for note
// GET http://localhost:5000/api/notes/:id/versions
// -------------------------
router.get("/:id/versions", fetchuser, async (req, res) => {
	try {
		const noteId = req.params.id;

		// Ensure note exists and belongs to user
		const note = await notes.findById(noteId);
		if (!note) return res.status(404).send("Note not found");
		if (note.user.toString() !== req.user.id) return res.status(401).send("Not allowed");

		const versions = await NoteVersion.find({ note: noteId }).sort({ savedAt: -1 }).lean();
		res.json(versions);
	} catch (err) {
		console.error(err);
		res.status(500).send("Server error occured.");
	}
});

// -------------------------
// NEW: Restore a version
// POST http://localhost:5000/api/notes/:noteId/restore/:versionId
// -------------------------
router.post("/:noteId/restore/:versionId", fetchuser, async (req, res) => {
	try {
		const { noteId, versionId } = req.params;

		const note = await notes.findById(noteId);
		const version = await NoteVersion.findById(versionId);

		if (!note || !version) return res.status(404).send("Note or version not found");
		if (note.user.toString() !== req.user.id) return res.status(401).send("Not allowed");
		if (version.note.toString() !== noteId) return res.status(400).send("Version does not belong to this note");

		// Save current note as backup version
		try {
			await NoteVersion.create({
				note: note._id,
				user: req.user.id,
				title: note.title,
				description: note.description,
				tag: note.tag,
				imagePath: note.imagePath,
				imageOriginalName: note.imageOriginalName,
				attachments: note.attachments,
				isPinned: note.isPinned,
				reminderAt: note.reminderAt,
				comment: `Backup before restore from ${versionId}`,
			});

			pruneNoteVersions(note._id, 10);
		} catch (verErr) {
			console.error("Failed to create backup version before restore:", verErr);
		}

		// Restore fields from version
		note.title = version.title;
		note.description = version.description;
		note.tag = version.tag;
		note.imagePath = version.imagePath;
		note.imageOriginalName = version.imageOriginalName;
		note.attachments = version.attachments;
		note.isPinned = version.isPinned;
		note.reminderAt = version.reminderAt;

		await note.save();

		// Create a version entry to record the restoration's result (optional)
		try {
			await NoteVersion.create({
				note: note._id,
				user: req.user.id,
				title: note.title,
				description: note.description,
				tag: note.tag,
				imagePath: note.imagePath,
				imageOriginalName: note.imageOriginalName,
				attachments: note.attachments,
				isPinned: note.isPinned,
				reminderAt: note.reminderAt,
				comment: `Restored from version ${versionId}`,
			});

			pruneNoteVersions(note._id, 10);
		} catch (verErr) {
			console.error("Failed to create version after restore:", verErr);
		}

		res.json({ success: true, note });
	} catch (err) {
		console.error(err);
		res.status(500).send("Server error occured.");
	}
});

module.exports = router;

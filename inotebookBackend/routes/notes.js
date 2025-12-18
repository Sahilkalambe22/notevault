const express = require("express");
const router = express.Router();

const notes = require("../models/Note");
const NoteVersion = require("../models/NoteVersion");

const fetchuser = require("../middleware/fetchuser");
const upload = require("../middleware/uploads");
const pruneNoteVersions = require("../utils/pruneNoteVersions");

const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");

/* ===============================
   ObjectId validator (INLINE)
=============================== */
const validateObjectId = (paramName = "id") => {
  return (req, res, next) => {
    const value = req.params[paramName];
    if (!value || !mongoose.Types.ObjectId.isValid(value)) {
      return res.status(400).json({
        error: `Invalid ${paramName}`,
      });
    }
    next();
  };
};

/* =====================================================
   ROUTE 1: FETCH ALL NOTES
   GET /api/notes/fetchallnotes
===================================================== */
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const note = await notes
      .find({ user: req.user.id })
      .sort({ isPinned: -1, date: -1 });

    res.json(note);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error occurred.");
  }
});

/* =====================================================
   ROUTE 2: ADD NOTE
   POST /api/notes/addnotes
===================================================== */
router.post(
  "/addnotes",
  fetchuser,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "attachments", maxCount: 3 },
  ]),
  [
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "Description must be at least 10 characters").isLength({
      min: 10,
    }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, tag, reminderAt } = req.body;

      const imageFile = req.files?.image?.[0];
      let imagePath, imageOriginalName;

      if (imageFile) {
        imagePath = `/uploads/${imageFile.filename}`;
        imageOriginalName = imageFile.originalname;
      }

      const attachmentFiles = req.files?.attachments || [];
      const attachments = attachmentFiles.map((file) => ({
        path: `/uploads/${file.filename}`,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      }));

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

      const savedNote = await note.save();

      // Initial version snapshot
      try {
        await NoteVersion.create({
          note: savedNote._id,
          user: req.user.id,
          title: savedNote.title,
          description: savedNote.description,
          tag: savedNote.tag,
          imagePath: savedNote.imagePath,
          imageOriginalName: savedNote.imageOriginalName,
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
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error occurred.");
    }
  }
);

/* =====================================================
   ROUTE 3: UPDATE NOTE
   PUT /api/notes/updatenote/:id
===================================================== */
router.put(
  "/updatenote/:id",
  fetchuser,
  validateObjectId("id"),
  async (req, res) => {
    try {
      let note = await notes.findById(req.params.id);
      if (!note) return res.status(404).send("Note not found");

      if (note.user.toString() !== req.user.id) {
        return res.status(401).send("Not allowed");
      }

      // Save version BEFORE update
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

        pruneNoteVersions(note._id, 10);
      } catch (err) {
        console.error("Version snapshot error:", err);
      }

      const newNote = {};

      for (let key in req.body) {
        if (key === "reminderAt") {
          const val = req.body.reminderAt;
          newNote.reminderAt =
            val === "" || val === null || val === undefined
              ? null
              : new Date(val);
        } else {
          newNote[key] = req.body[key];
        }
      }

      note = await notes.findByIdAndUpdate(
        req.params.id,
        { $set: newNote },
        { new: true }
      );

      res.json(note);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error occurred.");
    }
  }
);

/* =====================================================
   ROUTE 4: DELETE NOTE
   DELETE /api/notes/deletenote/:id
===================================================== */
router.delete(
  "/deletenote/:id",
  fetchuser,
  validateObjectId("id"),
  async (req, res) => {
    try {
      let note = await notes.findById(req.params.id);
      if (!note) return res.status(404).send("Note not found");

      if (note.user.toString() !== req.user.id) {
        return res.status(401).send("Not allowed");
      }

      await notes.findByIdAndDelete(req.params.id);

      try {
        await NoteVersion.deleteMany({ note: req.params.id });
      } catch (err) {
        console.error("Version delete error:", err);
      }

      res.json({ success: true });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error occurred.");
    }
  }
);

/* =====================================================
   ROUTE 5: GET NOTE VERSIONS
   GET /api/notes/:id/versions
===================================================== */
router.get(
  "/:id/versions",
  fetchuser,
  validateObjectId("id"),
  async (req, res) => {
    try {
      const note = await notes.findById(req.params.id);
      if (!note) return res.status(404).send("Note not found");

      if (note.user.toString() !== req.user.id) {
        return res.status(401).send("Not allowed");
      }

      const versions = await NoteVersion.find({ note: req.params.id })
        .sort({ savedAt: -1 })
        .lean();

      res.json(versions);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error occurred.");
    }
  }
);

/* =====================================================
   ROUTE 6: RESTORE VERSION
   POST /api/notes/:noteId/restore/:versionId
===================================================== */
router.post(
  "/:noteId/restore/:versionId",
  fetchuser,
  validateObjectId("noteId"),
  validateObjectId("versionId"),
  async (req, res) => {
    try {
      const { noteId, versionId } = req.params;

      const note = await notes.findById(noteId);
      const version = await NoteVersion.findById(versionId);

      if (!note || !version)
        return res.status(404).send("Note or version not found");

      if (note.user.toString() !== req.user.id)
        return res.status(401).send("Not allowed");

      if (version.note.toString() !== noteId)
        return res.status(400).send("Version mismatch");

      // Backup current state
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
        comment: "Backup before restore",
      });

      pruneNoteVersions(note._id, 10);

      // Restore
      Object.assign(note, {
        title: version.title,
        description: version.description,
        tag: version.tag,
        imagePath: version.imagePath,
        imageOriginalName: version.imageOriginalName,
        attachments: version.attachments,
        isPinned: version.isPinned,
        reminderAt: version.reminderAt,
      });

      await note.save();

      res.json({ success: true, note });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error occurred.");
    }
  }
);

module.exports = router;

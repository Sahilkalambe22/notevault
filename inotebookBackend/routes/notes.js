const express = require("express");
const router = express.Router();

const Note = require("../models/Note");
const NoteVersion = require("../models/NoteVersion");

const fetchuser = require("../middleware/fetchuser");
const upload = require("../middleware/uploads");
const pruneNoteVersions = require("../utils/pruneNoteVersions");

const { body, validationResult } = require("express-validator");
const mongoose = require("mongoose");

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
    const notes = await Note.find({ user: req.user.id })
      .sort({ isPinned: -1, date: -1 });
    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error occurred.");
  }
});

/* =====================================================
   ROUTE 2: ADD NOTE
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
      const attachmentFiles = req.files?.attachments || [];

      const note = new Note({
        title,
        description,
        tag,
        user: req.user.id,
        imagePath: imageFile ? `/uploads/${imageFile.filename}` : null,
        imageOriginalName: imageFile ? imageFile.originalname : null,
        attachments: attachmentFiles.map((file) => ({
          path: `/uploads/${file.filename}`,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
        })),
        reminderAt: reminderAt ? new Date(reminderAt) : null,
      });

      const savedNote = await note.save();

      // Initial version
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
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error occurred.");
    }
  }
);

/* =====================================================
   ROUTE 3: UPDATE NOTE (SAFE MULTIPART + JSON)
===================================================== */
router.put(
  "/updatenote/:id",
  fetchuser,
  validateObjectId("id"),
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "attachments", maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      const note = await Note.findById(req.params.id);
      if (!note) return res.status(404).send("Note not found");

      if (note.user.toString() !== req.user.id) {
        return res.status(401).send("Not allowed");
      }

      /* ========= SAVE VERSION ========= */
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

      /* ========= IMAGE UPLOAD ========= */
      const imageFile = req.files?.image?.[0];
      if (imageFile) {
        note.imagePath = `/uploads/${imageFile.filename}`;
        note.imageOriginalName = imageFile.originalname;
      }

      /* ========= IMAGE REMOVE ========= */
      if (
        req.body.imagePath === null ||
        req.body.imagePath === "null"
      ) {
        note.imagePath = null;
        note.imageOriginalName = null;
      }

      /* ========= ATTACHMENTS ========= */
      const attachmentFiles = req.files?.attachments || [];
      if (attachmentFiles.length > 0) {
        note.attachments.push(
          ...attachmentFiles.map((file) => ({
            path: `/uploads/${file.filename}`,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
          }))
        );
      }

      /* ========= SAFE BODY UPDATES ========= */
      const allowedFields = ["title", "description", "tag", "reminderAt"];
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          if (field === "reminderAt") {
            const val = req.body.reminderAt;
            note.reminderAt =
              val === "" || val === null || val === "null"
                ? null
                : new Date(val);
          } else {
            note[field] = req.body[field];
          }
        }
      });

      await note.save();
      res.json(note);
    } catch (err) {
      console.error("Update note error:", err);
      res.status(500).send("Server error occurred.");
    }
  }
);

/* =====================================================
   ROUTE 4: DELETE NOTE
===================================================== */
router.delete(
  "/deletenote/:id",
  fetchuser,
  validateObjectId("id"),
  async (req, res) => {
    try {
      const note = await Note.findById(req.params.id);
      if (!note) return res.status(404).send("Note not found");

      if (note.user.toString() !== req.user.id) {
        return res.status(401).send("Not allowed");
      }

      await Note.findByIdAndDelete(req.params.id);
      await NoteVersion.deleteMany({ note: req.params.id });

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error occurred.");
    }
  }
);

/* =====================================================
   ROUTE 5: GET NOTE VERSIONS
===================================================== */
router.get(
  "/:id/versions",
  fetchuser,
  validateObjectId("id"),
  async (req, res) => {
    try {
      const note = await Note.findById(req.params.id);
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
===================================================== */
router.post(
  "/:noteId/restore/:versionId",
  fetchuser,
  validateObjectId("noteId"),
  validateObjectId("versionId"),
  async (req, res) => {
    try {
      const { noteId, versionId } = req.params;

      const note = await Note.findById(noteId);
      const version = await NoteVersion.findById(versionId);

      if (!note || !version)
        return res.status(404).send("Note or version not found");

      if (note.user.toString() !== req.user.id)
        return res.status(401).send("Not allowed");

      if (version.note.toString() !== noteId)
        return res.status(400).send("Version mismatch");

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

/* =====================================================
   ROUTE 7: DELETE ATTACHMENT
===================================================== */
router.delete(
  "/:id/attachments/:index",
  fetchuser,
  validateObjectId("id"),
  async (req, res) => {
    try {
      const { id, index } = req.params;

      const note = await Note.findById(id);
      if (!note) return res.status(404).send("Note not found");

      if (note.user.toString() !== req.user.id) {
        return res.status(401).send("Not allowed");
      }

      if (!note.attachments[index]) {
        return res.status(404).send("Attachment not found");
      }

      note.attachments.splice(index, 1);
      await note.save();

      res.json(note);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error occurred.");
    }
  }
);

module.exports = router;

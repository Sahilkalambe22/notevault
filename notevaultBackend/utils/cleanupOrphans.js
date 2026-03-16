const fs = require("fs");
const path = require("path");

const Note = require("../models/Note");
const NoteVersion = require("../models/NoteVersion");

const uploadsDir = path.join(__dirname, "../uploads");

const cleanupOrphans = async () => {
	try {
		const usedFiles = new Set();

		/* ==============================
		   NOTES
		============================== */

		const notes = await Note.find({}, "attachments description").lean();

		for (const note of notes) {
			note.attachments?.forEach((a) => {
				if (a.path) usedFiles.add(path.basename(a.path));
			});

			if (note.description) {
				const matches = note.description.match(/\/uploads\/([a-zA-Z0-9._-]+)/g);

				matches?.forEach((m) => {
					usedFiles.add(path.basename(m));
				});
			}
		}

		/* ==============================
		   NOTE VERSIONS (STREAMED)
		============================== */

		const cursor = NoteVersion.find({}, "attachments description").cursor();

		for await (const v of cursor) {
			v.attachments?.forEach((a) => {
				if (a.path) usedFiles.add(path.basename(a.path));
			});

			if (v.description) {
				const matches = v.description.match(/\/uploads\/([a-zA-Z0-9._-]+)/g);

				matches?.forEach((m) => {
					usedFiles.add(path.basename(m));
				});
			}
		}

		/* ==============================
		   SCAN UPLOAD DIRECTORY
		============================== */

		const files = fs.readdirSync(uploadsDir);

		let deleted = 0;

		for (const file of files) {
			if (file.startsWith(".")) continue;

			if (!usedFiles.has(file)) {
				const filePath = path.join(uploadsDir, file);

				const stats = fs.statSync(filePath);
				const age = Date.now() - stats.mtimeMs;

				/* don't delete very recent uploads */
				if (age > 1000 * 60 * 10) {
					fs.unlinkSync(filePath);
					deleted++;
				}
			}
		}

		console.log(`Orphan cleanup finished. Deleted ${deleted} files.`);
	} catch (err) {
		console.error("Orphan cleanup error:", err);
	}
};

module.exports = cleanupOrphans;

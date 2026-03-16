const fs = require("fs");
const path = require("path");

const Note = require("../models/Note");
const NoteVersion = require("../models/NoteVersion");

const uploadsDir = path.join(__dirname, "../uploads");

const cleanupOrphans = async () => {
	try {
		const usedFiles = new Set();

		/* ===============================
		   ACTIVE NOTES
		=============================== */

		const notes = await Note.find({}, "attachments description").lean();

		for (const note of notes) {
			/* attachments */
			note.attachments?.forEach((a) => {
				if (a.path) usedFiles.add(path.basename(a.path));
			});

			/* inline images */
			if (note.description) {
				const matches = note.description.match(/\/uploads\/([a-zA-Z0-9._-]+)/g);

				matches?.forEach((m) => {
					usedFiles.add(path.basename(m));
				});
			}
		}

		/* ===============================
		   NOTE VERSIONS
		=============================== */

		const versions = await NoteVersion.find({}, "attachments description").lean();

		for (const v of versions) {
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

		/* ===============================
		   FILE SYSTEM
		=============================== */

		const files = fs.readdirSync(uploadsDir);

		for (const file of files) {
			if (file.startsWith(".")) continue;

			if (!usedFiles.has(file)) {
				const filePath = path.join(uploadsDir, file);

				const stats = fs.statSync(filePath);
				const age = Date.now() - stats.mtimeMs;

				/* only delete files older than 10 minutes */
				if (age > 1000 * 60 * 10) {
					fs.unlinkSync(filePath);

					console.log("Deleted orphan file:", file);
				}
			}
		}

		console.log("Orphan cleanup finished");
	} catch (err) {
		console.error("Orphan cleanup error:", err);
	}
};

module.exports = cleanupOrphans;
 
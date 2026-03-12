const fs = require("fs");
const path = require("path");
const Note = require("../models/Note");

const uploadsDir = path.join(__dirname, "../uploads");

const cleanupOrphans = async () => {
	try {
		const notes = await Note.find({}, "attachments");

		const usedFiles = new Set();

		notes.forEach((note) => {
			note.attachments.forEach((a) => {
				usedFiles.add(path.basename(a.path));
			});
		});

		const files = fs.readdirSync(uploadsDir);

		for (const file of files) {
			if (!usedFiles.has(file)) {
				fs.unlinkSync(path.join(uploadsDir, file));
				console.log("Deleted orphan file:", file);
			}
		}
	} catch (err) {
		console.error("Orphan cleanup error:", err);
	}
};

module.exports = cleanupOrphans;

const NoteVersion = require("../models/NoteVersion");

/**
 * Keep only the last `maxVersions` for a given note id.
 * This finds the oldest versions beyond the allowed count and deletes them.
 *
 * @param {ObjectId|string} noteId
 * @param {number} maxVersions
 */
async function pruneNoteVersions(noteId, maxVersions = 10) {
	try {
		const count = await NoteVersion.countDocuments({ note: noteId });
		if (count > maxVersions) {
			const toDelete = count - maxVersions;
			const oldVersions = await NoteVersion.find({ note: noteId })
				.sort({ savedAt: 1 })
				.limit(toDelete)
				.select("_id")
				.lean();
			const ids = oldVersions.map((v) => v._id);
			if (ids.length) {
				await NoteVersion.deleteMany({ _id: { $in: ids } });
			}
		}
	} catch (err) {
		console.error("pruneNoteVersions error:", err);
	}
}

module.exports = pruneNoteVersions;

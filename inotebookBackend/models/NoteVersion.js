const mongoose = require("mongoose");

const NoteVersionSchema = new mongoose.Schema({
	note: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "notes",
		required: true,
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},

	title: String,
	description: String,
	tag: String,

	imagePath: String,
	imageOriginalName: String,

	attachments: [
		{
			path: String,
			originalName: String,
			mimeType: String,
			size: Number,
		},
	],

	isPinned: Boolean,
	reminderAt: Date,

	savedAt: {
		type: Date,
		default: Date.now,
	},

	comment: String, // optional: "before edit", "restored", etc.
});

// index to fetch recent versions quickly
NoteVersionSchema.index({ note: 1, savedAt: -1 });

module.exports = mongoose.model("NoteVersion", NoteVersionSchema);

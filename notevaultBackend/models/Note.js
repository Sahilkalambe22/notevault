const mongoose = require("mongoose");
const { Schema } = mongoose;

const NotesSchema = new Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
	title: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	tag: {
		type: String,
	},

	// 🔹 Multiple attachments (optional)
	attachments: [
		{
			path: String,
			originalName: String,
			mimeType: String,
			size: Number,
		},
	],
	isPinned: {
		type: Boolean,
		default: false,
	},
	reminderAt: {
		type: Date,
		default: null,
	},
	reminderSent: {
		type: Boolean,
		default: false,
	},

	date: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model("notes", NotesSchema);

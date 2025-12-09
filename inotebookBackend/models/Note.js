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
	// 🔹 Single image per note (optional)
	imagePath: {
		type: String,
	},
	imageOriginalName: {
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

	date: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model("notes", NotesSchema);

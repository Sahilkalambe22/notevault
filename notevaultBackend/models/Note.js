const mongoose = require("mongoose");
const { Schema } = mongoose;

const NotesSchema = new Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},

		title: {
			type: String,
			required: true,
			trim: true,
			maxlength: 200,
		},

		description: {
			type: String,
			required: true,
			maxlength: 50000,
		},

		tag: {
			type: String,
			trim: true,
			maxlength: 50,
		},

		// 🔹 Multiple attachments
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
			index: true,
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
			index: true,
		},

		shareId: {
			type: String,
			unique: true,
			sparse: true,
		},

		isPublic: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true },
);

/* ==============================
   INDEXES (for performance)
============================== */

// Full text search support
NotesSchema.index({
	title: "text",
	description: "text",
	tag: "text",
});

NotesSchema.index({user: 1, isPinned: -1, date: -1, reminderAt: 1, reminderSent: 1 });

module.exports = mongoose.model("notes", NotesSchema);

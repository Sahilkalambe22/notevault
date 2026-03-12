const cron = require("node-cron");
const Note = require("../models/Note");
const transporter = require("../utils/mailer");
const cleanupOrphans = require("./cleanupOrphans");

// Runs every minute
cron.schedule("* * * * *", async () => {
	try {
		const now = new Date();

		const notes = await Note.find({
			reminderAt: { $lte: now },
			reminderSent: false,
		})
			.populate("user", "email")
			.limit(50);

		for (const note of notes) {
			try {
				if (!note.user?.email) continue;
 
				note.reminderSent = true;
				await note.save();

				await transporter.sendMail({
					from: process.env.EMAIL_USER,
					to: note.user.email,
					subject: "NoteVault Reminder",
					html: `
						<h2>⏰ Reminder</h2>
						<p><strong>${note.title}</strong></p>
						<p>This is a reminder for your note.</p>
					`,
				});

			} catch (err) {
				console.error("Email failed for note:", note._id, err);
			}
		}
	} catch (error) {
		console.error("Reminder Worker Error:", error);
	}


});

    // Cleanup orphan attachments every hour
cron.schedule("0 3 * * *", async () => {
	try {
		await cleanupOrphans();
		console.log("🧹 Orphan files cleaned");
	} catch (err) {
		console.error("Orphan cleanup failed:", err);
	}
});
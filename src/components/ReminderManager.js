import { useEffect } from "react";

const ReminderManager = ({ notes, showAlert }) => {
	useEffect(() => {
		if (typeof window === "undefined") return;
		if (!("Notification" in window)) return;

		// Ask for permission once (best-effort)
		if (Notification.permission === "default") {
			Notification.requestPermission().catch(() => {});
		}

		const timeouts = [];
		const now = Date.now();

		(notes || []).forEach((note) => {
			if (!note.reminderAt) return;

			const when = new Date(note.reminderAt).getTime();
			if (Number.isNaN(when)) return;

			const delay = when - now;
			if (delay <= 0) return; // already past
			// Optional: only schedule within next 24 hours
			if (delay > 24 * 60 * 60 * 1000) return;

			const timeoutId = setTimeout(() => {
				const title = note.title || "Note Reminder";
				const plainDesc = (note.description || "")
					.replace(/<[^>]+>/g, "")
					.trim();

				// In-app alert
				if (showAlert) {
					showAlert(`Reminder: ${title}`, "info");
				}

				// Browser notification
				if (Notification.permission === "granted") {
					try {
						new Notification("Note Reminder", {
							body: plainDesc || title,
						});
					} catch {
						// ignore
					}
				}
			}, delay);

			timeouts.push(timeoutId);
		});

		// cleanup when notes change / unmount
		return () => {
			timeouts.forEach((id) => clearTimeout(id));
		};
	}, [notes, showAlert]);

	return null; // no UI, just background logic
};

export default ReminderManager;

import { useEffect, useRef } from "react";

const ReminderManager = ({ notes, showAlert, updateReminder }) => {
	// Map: noteId → timeoutId
	const timeoutsRef = useRef(new Map());

	useEffect(() => {
		if (typeof window === "undefined") return;
		if (!("Notification" in window)) return;

		if (Notification.permission === "default") {
			Notification.requestPermission().catch(() => {});
		}

		const now = Date.now();
		const activeIds = new Set();

		// ✅ snapshot ref for eslint-safe cleanup
		const timeouts = timeoutsRef.current;

		(notes || []).forEach((note) => {
			if (!note?._id) return;

			activeIds.add(note._id);

			/* 🔴 No reminder → clear existing timeout */
			if (!note.reminderAt) {
				const oldTimeout = timeouts.get(note._id);
				if (oldTimeout) {
					clearTimeout(oldTimeout);
					timeouts.delete(note._id);
				}
				return;
			}

			const when = new Date(note.reminderAt).getTime();
			if (Number.isNaN(when)) return;

			const delay = when - now;
			// 🔥 If reminder already passed → clear immediately
			if (delay <= 0) {
				updateReminder(note._id, null);
				return;
			}

			// Ignore very distant reminders (24h limit)
			if (delay > 24 * 60 * 60 * 1000) return;

			// 🔁 Already scheduled → skip
			if (timeouts.has(note._id)) return;

			const timeoutId = setTimeout(async () => {
				const title = note.title || "Note Reminder";
				const plainDesc = (note.description || "").replace(/<[^>]+>/g, "").trim();

				// In-app alert
				showAlert?.(`Reminder: ${title}`, "info");

				// Browser notification
				if (Notification.permission === "granted") {
					try {
						new Notification("Note Reminder", {
							body: plainDesc || title,
						});
					} catch {}
				}

				// cleanup after fire
				// 🔥 Remove reminder after firing
				await updateReminder(note._id, null);
				timeouts.delete(note._id);
			}, delay);

			timeouts.set(note._id, timeoutId);
		});

		/* 🧹 Remove timeouts for deleted notes */
		for (const [id, timeoutId] of timeouts.entries()) {
			if (!activeIds.has(id)) {
				clearTimeout(timeoutId);
				timeouts.delete(id);
			}
		}

		/* 🧹 Cleanup on unmount */
		return () => {
			for (const timeoutId of timeouts.values()) {
				clearTimeout(timeoutId);
			}
			timeouts.clear();
		};
	}, [notes, showAlert, updateReminder]);

	return null;
};

export default ReminderManager;

import { useEffect, useRef } from "react";

const ReminderManager = ({ notes, showAlert }) => {
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

    (notes || []).forEach((note) => {
      if (!note._id) return;

      activeIds.add(note._id);

      // 🔴 No reminder → clear existing timeout
      if (!note.reminderAt) {
        const oldTimeout = timeoutsRef.current.get(note._id);
        if (oldTimeout) {
          clearTimeout(oldTimeout);
          timeoutsRef.current.delete(note._id);
        }
        return;
      }

      const when = new Date(note.reminderAt).getTime();
      if (Number.isNaN(when)) return;

      const delay = when - now;

      // Ignore past or very distant reminders
      if (delay <= 0 || delay > 24 * 60 * 60 * 1000) return;

      // 🔁 If already scheduled, skip
      if (timeoutsRef.current.has(note._id)) return;

      const timeoutId = setTimeout(() => {
        const title = note.title || "Note Reminder";
        const plainDesc = (note.description || "")
          .replace(/<[^>]+>/g, "")
          .trim();

        showAlert?.(`Reminder: ${title}`, "info");

        if (Notification.permission === "granted") {
          try {
            new Notification("Note Reminder", {
              body: plainDesc || title,
            });
          } catch {}
        }

        // cleanup after fire
        timeoutsRef.current.delete(note._id);
      }, delay);

      timeoutsRef.current.set(note._id, timeoutId);
    });

    // 🧹 Cleanup removed notes
    for (const [id, timeoutId] of timeoutsRef.current.entries()) {
      if (!activeIds.has(id)) {
        clearTimeout(timeoutId);
        timeoutsRef.current.delete(id);
      }
    }

    // 🧹 Cleanup on unmount
    return () => {
      for (const timeoutId of timeoutsRef.current.values()) {
        clearTimeout(timeoutId);
      }
      timeoutsRef.current.clear();
    };
  }, [notes, showAlert]);

  return null;
};

export default ReminderManager;

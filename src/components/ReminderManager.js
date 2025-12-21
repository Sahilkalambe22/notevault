import { useEffect, useRef } from "react";

const ReminderManager = ({ notes, showAlert }) => {
  const scheduledRef = useRef(new Set());

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;

    if (Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }

    const now = Date.now();

    (notes || []).forEach((note) => {
      if (!note._id || !note.reminderAt) return;

      // ✅ already scheduled → skip
      if (scheduledRef.current.has(note._id)) return;

      const when = new Date(note.reminderAt).getTime();
      if (Number.isNaN(when)) return;

      const delay = when - now;
      if (delay <= 0 || delay > 24 * 60 * 60 * 1000) return;

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

        // ✅ remove after firing
        scheduledRef.current.delete(note._id);
      }, delay);

      scheduledRef.current.add(note._id);

      // store timeout id on note (optional)
      note.__timeoutId = timeoutId;
    });

    return () => {};
  }, [notes, showAlert]);

  return null;
};

export default ReminderManager;

import React, { useContext } from "react";
import noteContext from "../context/notes/notesContext";
import PinButton from "./PinButton";
import ReminderBadge from "./ReminderBadge";

/* ================= TAG CONFIG ================= */

const TAG_COLOR_MAP = {
  Work: "primary",
  Random: "secondary",
  Important: "danger",
  Todo: "success",
  Personal: "light",
  Priority: "warning",
};

const TAG_ICON_MAP = {
  Work: "fa-solid fa-briefcase",
  Important: "fa-solid fa-triangle-exclamation",
  Personal: "fa-solid fa-user",
  Todo: "fa-solid fa-list-check",
  Random: "fa-solid fa-shuffle",
  Priority: "fa-solid fa-bolt",
};

/* ================= COMPONENT ================= */

const NoteItem = (props) => {
  const { deleteNote, pinNote } = useContext(noteContext);
  const { note, updateNote, showAlert } = props;

  /* ================= TAG NORMALIZATION ================= */

  const rawTag = (note.tag || "Random").trim();
  const normalizedTag = rawTag.toLowerCase();

  const canonicalTag = Object.keys(TAG_COLOR_MAP).find(
    (t) => t.toLowerCase() === normalizedTag
  );

  const effectiveTag = canonicalTag || "Random";

  const badgeColor = TAG_COLOR_MAP[effectiveTag];
  const tagIconClass = TAG_ICON_MAP[effectiveTag] || null;

  const displayTag = canonicalTag ? canonicalTag : rawTag;
  const extraTextClass = badgeColor === "light" ? "text-dark" : "";

  /* ================= ACTIONS ================= */

  const handleDelete = (e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this note permanently?")) return;
    deleteNote(note._id);
    showAlert("Deleted successfully", "success");
  };

  const handlePin = (e) => {
    e.stopPropagation();
    pinNote(note._id, !note.isPinned);
    showAlert(
      note.isPinned ? "Note unpinned" : "Note pinned",
      "success"
    );
  };

  /* ================= RENDER ================= */

  return (
    <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12 mb-4">
      <div
        className={`card note-card h-100 d-flex flex-column position-relative ${
          note.isPinned ? "note-pinned" : ""
        }`}
        onClick={() => updateNote(note)}
      >
        {/* PIN BUTTON */}
        <PinButton isPinned={note.isPinned} onToggle={handlePin} />

        {/* MAIN CONTENT */}
        <div className="flex-grow-1 p-4">
          {/* TAG + REMINDER */}
          <div className="d-flex justify-content-between align-items-center mb-3 gap-2">
            <span
              className={`badge text-bg-${badgeColor} ${extraTextClass} rounded-pill d-inline-flex align-items-center`}
              style={{ gap: "6px" }}
            >
              {tagIconClass && <i className={`${tagIconClass} me-1`} />}
              {displayTag}
            </span>

            <ReminderBadge reminderAt={note.reminderAt} />
          </div>

          {/* TITLE */}
          <h6 className="fw-semibold mb-3 note-title">
            {note.title?.trim() || "Untitled"}
          </h6>

          {/* DESCRIPTION PREVIEW */}
          <div className="note-preview-text text-secondary">
            {(note.description || "")
              .replace(/<[^>]+>/g, "")
              .slice(0, 200)}
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="note-footer d-flex justify-content-end align-items-center px-3 py-2 gap-3">
          <button
            className="note-icon"
            onClick={(e) => {
              e.stopPropagation();
              updateNote(note);
            }}
          >
            <i className="fa-solid fa-user-pen" />
          </button>

          <button
            className="note-icon text-danger"
            onClick={handleDelete}
          >
            <i className="fa-solid fa-trash-can" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteItem;

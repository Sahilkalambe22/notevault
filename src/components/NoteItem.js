// src/components/NoteItem.js

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
  const { note, updateNote } = props;

  /* ================= TAG NORMALIZATION ================= */

  const rawTag = (note.tag || "Random").trim();
  const normalizedTag = rawTag.toLowerCase();

  const canonicalTag = Object.keys(TAG_COLOR_MAP).find(
    (t) => t.toLowerCase() === normalizedTag
  );

  // 🔥 FIX: custom tags = Random behavior
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
    props.showAlert("Deleted successfully", "success");
  };

  const handlePin = (e) => {
    e.stopPropagation();
    pinNote(note._id, !note.isPinned);
    props.showAlert(
      note.isPinned ? "Note unpinned" : "Note pinned",
      "success"
    );
  };

  return (
    <div className="col-md-3 mb-3">
      <div
        className="card shadow-sm h-100 d-flex flex-column position-relative"
        style={{ backgroundColor: "#f3ebc3ff", cursor: "pointer" }}
        onClick={() => updateNote(note)}
      >
        {/* PIN */}
        <PinButton isPinned={note.isPinned} onToggle={handlePin} />

        {/* CONTENT */}
        <div className="flex-grow-1 p-3">
          <div className="d-flex justify-content-between align-items-center mb-2 gap-2">
            <span
              className={`badge text-bg-${badgeColor} ${extraTextClass}`}
              style={{
                borderRadius: "999px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {tagIconClass && <i className={tagIconClass} />}
              {displayTag}
            </span>

            <ReminderBadge reminderAt={note.reminderAt} />
          </div>

          <h6 className="fw-bold mb-2">
            {note.title?.trim() || "Untitled"}
          </h6>

          <div className="note-preview-text text-muted">
            {(note.description || "")
              .replace(/<[^>]+>/g, "")
              .slice(0, 200)}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-2 border-top d-flex gap-3">
          <i className="fa-solid fa-user-pen" />
          <i
            className="fa-solid fa-trash-can"
            onClick={handleDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default NoteItem;

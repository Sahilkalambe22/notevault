import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import noteContext from "../context/notes/notesContext";

import NoteEditorPage from "./NoteEditorPage";
import NoteAttachmentsPanel from "./NoteAttachmentsPanel";
import "./ShowNote.css";

const ShowNote = ({ showAlert }) => {
  const { id } = useParams();
  const { notes, getNotes } = useContext(noteContext);

  const [loading, setLoading] = useState(true);

  /* =========================================
     🔥 Fetch notes on refresh / direct visit
     Ensures context is rehydrated after reload
  ========================================== */
  useEffect(() => {
    const load = async () => {
      if (localStorage.getItem("token")) {
        await getNotes();
      }
      setLoading(false);
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =========================================
     Find the note from context
  ========================================== */
  const existingNote =
    id === "new" ? null : notes.find((n) => n._id === id);

  /* =========================================
     🔥 Prevent blank editor before notes load
  ========================================== */
  if (id !== "new" && (loading || !existingNote)) {
    return <div style={{ padding: 40 }}>Loading note...</div>;
  }

  /* =========================================
     CLEAN VERTICAL STRUCTURE
     Editor first → Attachments bottom
  ========================================== */
  return (
    <div className="ne-layout">
      <div className="ne-container">

        {/* ======================
            CENTER EDITOR
        ======================= */}
        <NoteEditorPage
          note={existingNote}
          showAlert={showAlert}
        />

        {/* ======================
            ATTACHMENTS SECTION
        ======================= */}
        <div className="ne-bottom-section">
          <NoteAttachmentsPanel
            note={existingNote}
            showAlert={showAlert}
          />
        </div>

      </div>
    </div>
  );
};

export default ShowNote;

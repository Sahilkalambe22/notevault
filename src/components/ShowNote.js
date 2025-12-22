import React, { useContext } from "react";
import { useParams } from "react-router-dom";
import noteContext from "../context/notes/notesContext";

import NoteEditorPage from "./NoteEditorPage";
import NoteImagesPanel from "./NoteImagesPanel";
import NoteAttachmentsPanel from "./NoteAttachmentsPanel";

const ShowNote = ({ showAlert }) => {
  const { id } = useParams();
  const { notes } = useContext(noteContext);

  const existingNote =
  id === "new" ? null : notes.find((n) => n._id === id);

  return (
    <div className="ne-layout" style={{ paddingTop: "30px" }}>
      <div className="ne-shell">

        {/* DESKTOP LEFT */}
        <NoteImagesPanel
          note={existingNote}
          showAlert={showAlert}
        />

        {/* CENTER EDITOR */}
        <NoteEditorPage
          note={existingNote}
          showAlert={showAlert}
        />

        {/* DESKTOP RIGHT */}
        <NoteAttachmentsPanel
          note={existingNote}
          showAlert={showAlert}
        />

        {/* MOBILE */}
        <div className="ne-panels-row">
          <NoteImagesPanel
            note={existingNote}
            showAlert={showAlert}
          />
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

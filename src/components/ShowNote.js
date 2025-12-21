// src/components/ShowNote.jsx

import React, { useContext } from "react";
import { useParams } from "react-router-dom";
import noteContext from "../context/notes/notesContext";

import NoteEditorPage from "./NoteEditorPage";
import NoteImagesPanel from "./NoteImagesPanel";
import NoteAttachmentsPanel from "./NoteAttachmentsPanel";

const ShowNote = ({ showAlert }) => {
  const { id } = useParams();
  const { notes } = useContext(noteContext);

  const existingNote = notes.find((n) => n._id === id);

  return (
    <div className="ne-layout" style={{ paddingTop: "30px" }}>
      <div className="ne-shell">

        {/* DESKTOP LEFT */}
        <NoteImagesPanel
          image={
            existingNote?.imagePath
              ? {
                  path: existingNote.imagePath,
                  originalName: existingNote.imageOriginalName,
                }
              : null
          }
        />

        {/* CENTER EDITOR */}
        <NoteEditorPage
          note={existingNote}
          showAlert={showAlert}
        />

        {/* DESKTOP RIGHT */}
        <NoteAttachmentsPanel
          attachments={existingNote?.attachments || []}
        />

        {/* MOBILE ROW */}
        <div className="ne-panels-row">
          <NoteImagesPanel
            image={
              existingNote?.imagePath
                ? {
                    path: existingNote.imagePath,
                    originalName: existingNote.imageOriginalName,
                  }
                : null
            }
          />
          <NoteAttachmentsPanel
            attachments={existingNote?.attachments || []}
          />
        </div>

      </div>
    </div>
  );
};

export default ShowNote;

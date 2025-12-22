import React, { useRef, useContext } from "react";
import noteContext from "../context/notes/notesContext";

const NoteAttachmentsPanel = ({ note, showAlert }) => {
  const fileRef = useRef(null);
  const host = "http://localhost:5000";

  const { replaceNote } = useContext(noteContext);

  const handleUpload = async (files) => {
    if (!note?._id || !files?.length) return;

    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("attachments", f));

      const res = await fetch(
        `${host}/api/notes/updatenote/${note._id}`,
        {
          method: "PUT",
          headers: {
            "auth-token": localStorage.getItem("token"),
          },
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Upload failed");

      const updatedNote = await res.json();

      // 🔑 only sync state
      replaceNote(updatedNote);

      showAlert("Attachment added", "success");
    } catch (err) {
      console.error(err);
      showAlert("Upload failed", "danger");
    }
  };

  const handleRemove = async (index) => {
    if (!note?._id) return;

    try {
      const res = await fetch(
        `${host}/api/notes/${note._id}/attachments/${index}`,
        {
          method: "DELETE",
          headers: {
            "auth-token": localStorage.getItem("token"),
          },
        }
      );

      if (!res.ok) throw new Error("Delete failed");

      const updatedNote = await res.json();

      replaceNote(updatedNote);

      showAlert("Attachment removed", "success");
    } catch (err) {
      console.error(err);
      showAlert("Remove failed", "danger");
    }
  };

  return (
    <aside className="ne-side ne-attachments-panel">
      <div className="side-panel side-panel-full">
        <div className="side-panel-header">Attachments</div>

        <div className="side-panel-body side-panel-scroll">
          <button
            className="side-add"
            onClick={() => fileRef.current.click()}
          >
            + Add files
          </button>

          <input
            ref={fileRef}
            type="file"
            multiple
            hidden
            onChange={(e) => handleUpload([...e.target.files])}
          />

          <ul className="side-attachment-list">
            {!note?.attachments?.length && (
              <li style={{ opacity: 0.6 }}>No attachments</li>
            )}

            {note?.attachments?.map((a, i) => (
              <li key={i}>
                <span>{a.originalName}</span>

                <a
                  href={`${host}${a.path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fa-solid fa-link"></i>
                </a>

                <button
                  className="danger"
                  onClick={() => handleRemove(i)}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
};

export default NoteAttachmentsPanel;

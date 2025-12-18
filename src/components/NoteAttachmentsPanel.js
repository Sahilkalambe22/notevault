import React, { useRef } from "react";

const NoteAttachmentsPanel = ({ attachments = [], onUpload, onRemove }) => {
  const fileRef = useRef(null);

  return (
    <aside className="editor-side note-attachments-panel">
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
            onChange={(e) => onUpload([...e.target.files])}
          />

          <ul className="side-attachment-list">
            {attachments.map((a, i) => (
              <li key={i}>
                <span>📎 {a.originalName}</span>
                <button
                  className="danger"
                  onClick={() => onRemove(i)}
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

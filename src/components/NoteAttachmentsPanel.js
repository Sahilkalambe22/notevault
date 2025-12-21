import React, { useRef } from "react";

const NoteAttachmentsPanel = ({ attachments = [], onUpload, onRemove }) => {
  const fileRef = useRef(null);
  const host = "http://localhost:5000";

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
            onChange={(e) => onUpload([...e.target.files])}
          />

          <ul className="side-attachment-list">
            {attachments.map((a, i) => (
              <li key={i}>
                {/* FILE NAME (not clickable) */}
                <span>{a.originalName}</span>

                {/* OPEN IN NEW TAB ICON */}
                <a
                  href={`${host}${a.path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open in new tab"
                  style={{ marginRight: "10px", color: "#2563eb" }}
                >
                  <i className="fa-solid fa-link"></i>
                </a>

                {/* REMOVE BUTTON */}
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

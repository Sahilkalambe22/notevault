import React, { useRef } from "react";

const NoteImagesPanel = ({ image, onUpload, onRemove }) => {
  const fileRef = useRef(null);

  return (
    <aside className="editor-side note-images-panel">
      <div className="side-panel side-panel-full">
        <div className="side-panel-header">Images</div>

        <div className="side-panel-body side-panel-scroll">
          {image ? (
            <>
              <img
                src={`http://localhost:5000${image.path}`}
                alt={image.originalName}
                className="side-image-preview"
              />

              <div className="side-actions">
                <button onClick={() => fileRef.current.click()}>
                  Replace
                </button>
                <button className="danger" onClick={onRemove}>
                  Remove
                </button>
              </div>
            </>
          ) : (
            <button
              className="side-add"
              onClick={() => fileRef.current.click()}
            >
              + Add image
            </button>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => e.target.files[0] && onUpload(e.target.files[0])}
        />
      </div>
    </aside>
  );
};

export default NoteImagesPanel;

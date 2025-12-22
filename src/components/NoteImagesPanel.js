import React, { useRef, useContext } from "react";
import noteContext from "../context/notes/notesContext";

const NoteImagesPanel = ({ note, showAlert }) => {
  const fileRef = useRef(null);
  const host = "http://localhost:5000";

  const { replaceNote } = useContext(noteContext);

  // normalize backend image fields → UI-friendly object
  const image = note?.imagePath
    ? {
        path: note.imagePath,
        originalName: note.imageOriginalName,
      }
    : null;

  const handleUpload = async (file) => {
    if (!note?._id || !file) return;

    try {
      const formData = new FormData();
      formData.append("image", file);

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

      // 🔑 IMPORTANT: only replace state, DO NOT call editNote
      replaceNote(updatedNote);

      showAlert("Image updated", "success");
    } catch (err) {
      console.error(err);
      showAlert("Image upload failed", "danger");
    }
  };

  const handleRemove = async () => {
    if (!note?._id) return;

    try {
      const res = await fetch(
        `${host}/api/notes/updatenote/${note._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "auth-token": localStorage.getItem("token"),
          },
          body: JSON.stringify({
            imagePath: null,
            imageOriginalName: null,
          }),
        }
      );

      if (!res.ok) throw new Error("Remove failed");

      const updatedNote = await res.json();

      // 🔑 sync frontend only
      replaceNote(updatedNote);

      showAlert("Image removed", "success");
    } catch (err) {
      console.error(err);
      showAlert("Remove failed", "danger");
    }
  };

  return (
    <aside className="ne-side ne-images-panel">
      <div className="side-panel side-panel-full">
        <div className="side-panel-header">Images</div>

        <div className="side-panel-body side-panel-scroll">
          {image ? (
            <>
              <a
                href={`${host}${image.path}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={`${host}${image.path}`}
                  alt={image.originalName}
                  className="side-image-preview"
                />
              </a>

              <div className="side-actions">
                <button onClick={() => fileRef.current.click()}>
                  Replace
                </button>
                <button className="danger" onClick={handleRemove}>
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
          onChange={(e) => handleUpload(e.target.files[0])}
        />
      </div>
    </aside>
  );
};

export default NoteImagesPanel;

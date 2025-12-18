// src/components/VersionHistoryModal.js

import React, { useEffect, useState, useContext, useRef } from "react";
import noteContext from "../context/notes/notesContext";
import DiffViewer from "./DiffViewer";

/**
 * Render a compact note preview card (same visual language as NoteItem)
 */
const NoteCardMini = ({ noteData, host = "http://localhost:5000" }) => {
  if (!noteData) return null;

  const savedTag = (noteData.tag || "").toString().trim();
  const variant = "secondary";
  const extraClasses = variant === "light" ? " text-dark" : "";

  return (
    <div className="card shadow-sm h-100" style={{ backgroundColor: "#f3ebc3ff" }}>
      <div className="card-body" style={{ overflow: "hidden" }}>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <small
            className={`badge text-bg-${variant}${extraClasses}`}
            style={{ borderRadius: 999, padding: "0.25rem 0.6rem" }}
          >
            {savedTag || "No tag"}
          </small>

          <small style={{ fontSize: 12, color: "#666" }}>
            {noteData.savedAt
              ? new Date(noteData.savedAt).toLocaleString()
              : ""}
          </small>
        </div>

        <h6 className="fw-bold mb-2">
          {noteData.title || "(no title)"}
        </h6>

        <div style={{ minHeight: 80, maxHeight: 160, overflowY: "auto" }}>
          <div
            dangerouslySetInnerHTML={{
              __html: noteData.description || "",
            }}
          />
        </div>

        {noteData.imagePath && (
          <div className="mt-2">
            <img
              src={`${host}${noteData.imagePath}`}
              alt={noteData.imageOriginalName || "image"}
              className="img-fluid rounded"
              style={{ maxHeight: 120, width: "100%", objectFit: "cover" }}
            />
          </div>
        )}

        {noteData.attachments?.length > 0 && (
          <div className="mt-2">
            <small className="text-muted">Attachments:</small>
            <div className="d-flex gap-2 flex-wrap mt-1">
              {noteData.attachments.map((a, i) => (
                <a
                  key={i}
                  href={`${host}${a.path}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm btn-outline-secondary"
                >
                  {a.originalName || `File ${i + 1}`}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const VersionHistoryModal = ({
  noteId,
  currentNote = {},
  onClose,
  showAlert,
}) => {
  const { getVersions, restoreVersion } = useContext(noteContext);

  const [versions, setVersions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const isSyncingRef = useRef(false);

  /* ================= LOAD VERSIONS ================= */

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!noteId) return;

      setLoading(true);
      try {
        const v = await getVersions(noteId);
        if (mounted) setVersions(v);
      } catch (err) {
        console.error(err);
        showAlert?.("Failed to load versions", "danger");
      } finally {
        setLoading(false);
      }
    })();

    return () => (mounted = false);
  }, [noteId, getVersions, showAlert]);

  /* ================= SYNC SCROLL ================= */

  useEffect(() => {
    const left = leftRef.current;
    const right = rightRef.current;
    if (!left || !right) return;

    const sync = (src, tgt) => {
      if (isSyncingRef.current) return;
      isSyncingRef.current = true;
      tgt.scrollTop = src.scrollTop;
      setTimeout(() => (isSyncingRef.current = false), 40);
    };

    const onLeft = () => sync(left, right);
    const onRight = () => sync(right, left);

    left.addEventListener("scroll", onLeft);
    right.addEventListener("scroll", onRight);

    return () => {
      left.removeEventListener("scroll", onLeft);
      right.removeEventListener("scroll", onRight);
    };
  }, [selected]);

  /* ================= RESTORE ================= */

  const handleRestore = async (versionId) => {
    if (!window.confirm("Restore this version? A backup will be saved."))
      return;

    try {
      setRestoring(true);
      await restoreVersion(noteId, versionId);
      showAlert?.("Version restored", "success");
      onClose();
    } catch (err) {
      console.error(err);
      showAlert?.("Restore failed", "danger");
    } finally {
      setRestoring(false);
    }
  };

  /* ================= RENDER ================= */

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      onClick={onClose}
      style={{ background: "rgba(0,0,0,0.6)" }}
    >
      <div
        className="modal-dialog modal-xl modal-dialog-scrollable"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Version history</h5>
            <button className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body">
            {loading ? (
              <p>Loading versions…</p>
            ) : versions.length === 0 ? (
              <p>No versions found.</p>
            ) : (
              <div className="row g-3">
                {/* LEFT LIST */}
                <div className="col-md-4">
                  <div
                    className="version-scroll"
                    style={{ maxHeight: "58vh", overflowY: "auto" }}
                  >
                    {versions.map((v) => (
                      <div
                        key={v._id}
                        className={`version-item p-2 mb-2 border rounded ${
                          selected?._id === v._id ? "active" : ""
                        }`}
                        onClick={() => setSelected(v)}
                      >
                        <div className="fw-semibold">
                          {decodeHtmlSafe(v.title) || "(no title)"}
                        </div>
                        <div className="text-muted" style={{ fontSize: 12 }}>
                          {new Date(v.savedAt).toLocaleString()}
                        </div>
                        {v.comment && (
                          <div style={{ fontSize: 12 }}>
                            {decodeHtmlSafe(v.comment)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* RIGHT PREVIEW + DIFF */}
                <div className="col-md-8">
                  <div className="row">
                    <div className="col-md-6">
                      <strong>Current</strong>
                      <div
                        ref={leftRef}
                        className="version-scroll"
                        style={{ maxHeight: "52vh", overflowY: "auto" }}
                      >
                        <NoteCardMini noteData={currentNote} />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <strong>Selected version</strong>
                        {selected && (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleRestore(selected._id)}
                            disabled={restoring}
                          >
                            {restoring ? "Restoring…" : "Restore"}
                          </button>
                        )}
                      </div>

                      <div
                        ref={rightRef}
                        className="version-scroll"
                        style={{ maxHeight: "52vh", overflowY: "auto" }}
                      >
                        {selected ? (
                          <>
                            <NoteCardMini noteData={selected} />
                            <div className="diff-container">
                              <DiffViewer
                                oldText={selected.description}
                                newText={currentNote.description}
                              />
                            </div>
                          </>
                        ) : (
                          <div className="text-muted p-3 border rounded">
                            Select a version to preview
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <small className="text-muted me-auto">
              Tip: restoring always saves a backup.
            </small>
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= HELPERS ================= */

function decodeHtmlSafe(str = "") {
  try {
    const txt = document.createElement("textarea");
    txt.innerHTML = str;
    return txt.value;
  } catch {
    return str;
  }
}

export default VersionHistoryModal;

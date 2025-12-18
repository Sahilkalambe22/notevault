import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import noteContext from "../context/notes/notesContext";

import RichTextEditor from "./RichTextEditor";
import VersionHistoryModal from "./VersionHistoryModal";
import NoteImagesPanel from "./NoteImagesPanel";
import NoteAttachmentsPanel from "./NoteAttachmentsPanel";

const TAGS = ["Work", "Random", "Important", "Todo", "Personal", "Priority"];

const TAG_COLOR_MAP = {
  Work: "primary",
  Random: "secondary",
  Important: "danger",
  Todo: "success",
  Personal: "light",
  Priority: "warning",
};

const NoteEditorPage = ({ showAlert }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    notes,
    addNote,
    editNote,
    deleteNote,
    pinNote,
    getNotes,
  } = useContext(noteContext);

  const isNew = id === "new";
  const existingNote = notes.find((n) => n._id === id);

  const saveTimer = useRef(null);
  const createdOnceRef = useRef(false);
  const createdNoteIdRef = useRef(null);

  const [data, setData] = useState({
    title: "",
    description: "",
    tagType: "",
    tagCustom: "",
  });

  const originalTagRef = useRef("");

  const [lastSaved, setLastSaved] = useState({
    title: "",
    description: "",
    tag: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showVersions, setShowVersions] = useState(false);

  /* ================= LOAD EXISTING NOTE ================= */

  useEffect(() => {
    if (!existingNote) return;

    const savedTag = (existingNote.tag || "").trim();
    originalTagRef.current = savedTag;

    let tagType = "";
    let tagCustom = "";

    if (TAGS.includes(savedTag)) tagType = savedTag;
    else tagCustom = savedTag;

    const initial = {
      title: existingNote.title || "",
      description: existingNote.description || "",
      tagType,
      tagCustom,
    };

    setData(initial);
    setLastSaved({
      title: initial.title,
      description: initial.description,
      tag: savedTag,
    });
  }, [existingNote]);

  /* ================= AUTO SAVE ================= */

  useEffect(() => {
    const plainDesc = data.description.replace(/<[^>]+>/g, "").trim();
    const hasContent =
      data.title.trim().length > 0 || plainDesc.length > 0;

    if (!hasContent) return;

    clearTimeout(saveTimer.current);

    saveTimer.current = setTimeout(async () => {
      if (isNew && !createdOnceRef.current) {
        setIsSaving(true);

        const resolvedTag =
          data.tagCustom || data.tagType || "Random";

        const created = await addNote(
          data.title || "Untitled",
          data.description,
          resolvedTag
        );

        if (created?._id) {
          createdOnceRef.current = true;
          createdNoteIdRef.current = created._id;
          navigate(`/note/${created._id}`, { replace: true });

          setLastSaved({
            title: created.title,
            description: created.description,
            tag: created.tag,
          });
        }

        setIsSaving(false);
        return;
      }

      const noteId = createdNoteIdRef.current || id;
      if (!noteId) return;

      let resolvedTag = originalTagRef.current;
      if (data.tagCustom) resolvedTag = data.tagCustom;
      else if (data.tagType) resolvedTag = data.tagType;

      const snapshot = {
        title: data.title.trim(),
        description: data.description,
        tag: resolvedTag,
      };

      if (
        snapshot.title === lastSaved.title &&
        snapshot.description === lastSaved.description &&
        snapshot.tag === lastSaved.tag
      )
        return;

      setIsSaving(true);
      await editNote(noteId, snapshot.title, snapshot.description, snapshot.tag);
      setLastSaved(snapshot);
      originalTagRef.current = snapshot.tag;

      setTimeout(() => setIsSaving(false), 300);
    }, 1000);

    return () => clearTimeout(saveTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  /* ================= IMAGE UPLOAD ================= */

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    await fetch(`http://localhost:5000/api/notes/updatenote/${id}`, {
      method: "PUT",
      headers: { "auth-token": localStorage.getItem("token") },
      body: formData,
    });

    getNotes();
  };

  /* ================= ATTACHMENTS ================= */

  const uploadAttachments = async (files) => {
    const formData = new FormData();
    files.forEach((f) => formData.append("attachments", f));

    await fetch(`http://localhost:5000/api/notes/updatenote/${id}`, {
      method: "PUT",
      headers: { "auth-token": localStorage.getItem("token") },
      body: formData,
    });

    getNotes();
  };

  /* ================= ACTIONS ================= */

  const handleBack = () => navigate(-1);

  const handleDelete = () => {
    if (!existingNote) return;
    if (!window.confirm("Delete this note permanently?")) return;
    deleteNote(existingNote._id);
    showAlert("Deleted successfully", "success");
    navigate("/profile");
  };

  const handlePin = () => {
    if (!existingNote) return;
    pinNote(existingNote._id, !existingNote.isPinned);
  };

  const displayTag =
    data.tagCustom || data.tagType || originalTagRef.current || "Random";

  const badgeColor = TAG_COLOR_MAP[data.tagType] || "secondary";

  /* ================= RENDER ================= */

  return (
    <>
      {showVersions && existingNote && (
        <VersionHistoryModal
          noteId={existingNote._id}
          currentNote={existingNote}
          onClose={() => setShowVersions(false)}
          showAlert={showAlert}
        />
      )}

      <div className="editor-shell">

        {/* LEFT — IMAGE */}
        <NoteImagesPanel
          image={
            existingNote?.imagePath
              ? {
                  path: existingNote.imagePath,
                  originalName: existingNote.imageOriginalName,
                }
              : null
          }
          onUpload={uploadImage}
        />

        {/* CENTER — EDITOR */}
        <div className="wf-editor-page">
          <div className="wf-editor-inner">

            <div className="wf-editor-topbar">
              <button className="wf-topbar-btn" onClick={handleBack}>
                <i className="fa-solid fa-arrow-left" />
              </button>

              <span style={{ color: isSaving ? "#ffaa00" : "#4CAF50" }}>
                {isSaving ? "Saving..." : "Saved"}
              </span>

              <div style={{ marginLeft: "auto", display: "flex", gap: 14 }}>
                {!isNew && (
                  <>
                    <i
                      className={`fa-solid fa-thumbtack editor-action${
                        existingNote?.isPinned ? " pinned" : ""
                      }`}
                      onClick={handlePin}
                    />
                    <i
                      className="fa-solid fa-clock-rotate-left editor-action"
                      onClick={() => setShowVersions(true)}
                    />
                    <i
                      className="fa-solid fa-trash-can editor-action"
                      onClick={handleDelete}
                    />
                  </>
                )}

                <span className={`badge text-bg-${badgeColor}`}>
                  {displayTag}
                </span>
              </div>
            </div>

            <input
              className="wf-editor-title-input"
              value={data.title}
              onChange={(e) =>
                setData((p) => ({ ...p, title: e.target.value }))
              }
              placeholder="Untitled"
            />

            <div className="wf-note-desc-editor">
              <RichTextEditor
                value={data.description}
                onChange={(html) =>
                  setData((p) => ({ ...p, description: html }))
                }
              />
            </div>
          </div>
        </div>

        {/* RIGHT — ATTACHMENTS */}
        <NoteAttachmentsPanel
          attachments={existingNote?.attachments || []}
          onUpload={uploadAttachments}
        />

      </div>
    </>
  );
};

export default NoteEditorPage;

import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import noteContext from "../context/notes/notesContext";

import TagSelectorModal from "./TagSelectorModal";
import RichTextEditor from "./RichTextEditor";
import VersionHistoryModal from "./VersionHistoryModal";

const TAGS = ["Work", "Random", "Important", "Todo", "Personal", "Priority"];

const TAG_COLOR_MAP = {
  Work: "primary",
  Random: "secondary",
  Important: "danger",
  Todo: "success",
  Personal: "light",
  Priority: "warning",
};

const NoteEditorPage = ({ note, showAlert}) => {
  const navigate = useNavigate();
  const { addNote, editNote, deleteNote, pinNote } =
    useContext(noteContext);

  const isNew = !note;

  const saveTimer = useRef(null);
  const createdOnceRef = useRef(false);
  const createdNoteIdRef = useRef(null);
  const originalTagRef = useRef("");

  const [data, setData] = useState({
    title: "",
    description: "",
    tagType: "",
    tagCustom: "",
  });

  const [tempTag, setTempTag] = useState({ type: "", custom: "" });
  const [lastSaved, setLastSaved] = useState({
    title: "",
    description: "",
    tag: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);

  /* ================= LOAD EXISTING NOTE ================= */
  useEffect(() => {
    if (!note) return;

    const savedTag = (note.tag || "").trim();
    originalTagRef.current = savedTag;

    setData({
      title: note.title || "",
      description: note.description || "",
      tagType: TAGS.includes(savedTag) ? savedTag : "",
      tagCustom: TAGS.includes(savedTag) ? "" : savedTag,
    });

    setLastSaved({
      title: note.title || "",
      description: note.description || "",
      tag: savedTag,
    });

    createdOnceRef.current = true;
    createdNoteIdRef.current = note._id;
  }, [note]);

  /* ================= AUTOSAVE ================= */
  useEffect(() => {
    const plainDesc = data.description.replace(/<[^>]+>/g, "").trim();
    if (!data.title.trim() && !plainDesc) return;

    clearTimeout(saveTimer.current);

    saveTimer.current = setTimeout(async () => {
      const resolvedTag = data.tagCustom || data.tagType || "Random";

      // 🔑 CREATE NOTE ONLY ON FIRST INPUT
      if (isNew && !createdOnceRef.current && !createdNoteIdRef.current) {
        setIsSaving(true);

        const created = await addNote(
          data.title || "Untitled",
          data.description,
          resolvedTag
        );

        if (created?._id) {
          createdOnceRef.current = true;
          createdNoteIdRef.current = created._id;

          // 🔑 switch from /note/new → /note/:id
          navigate(`/note/${created._id}`, { replace: true });
        }

        setIsSaving(false);
        return;
      }

      const noteId = createdNoteIdRef.current || note?._id;
      if (!noteId) return;

      if (
        data.title === lastSaved.title &&
        data.description === lastSaved.description &&
        resolvedTag === lastSaved.tag
      )
        return;

      setIsSaving(true);
      await editNote(noteId, data.title, data.description, resolvedTag);

      setLastSaved({
        title: data.title,
        description: data.description,
        tag: resolvedTag,
      });

      originalTagRef.current = resolvedTag;
      setTimeout(() => setIsSaving(false), 300);
    }, 1000);

    return () => clearTimeout(saveTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  /* ================= ACTIONS ================= */
  const handleDelete = () => {
    if (!note) return;
    if (!window.confirm("Delete this note permanently?")) return;
    deleteNote(note._id);
    navigate("/profile");
  };

  const handlePin = () => {
    if (!note) return;
    pinNote(note._id, !note.isPinned);
  };

  const displayTag =
    data.tagCustom || data.tagType || originalTagRef.current || "Random";

  const badgeColor =
    TAG_COLOR_MAP[data.tagType || "Random"] || "secondary";

  /* ================= RENDER ================= */
  return (
    <>
      <TagSelectorModal
        show={showTagModal}
        tags={TAGS}
        tagColorMap={TAG_COLOR_MAP}
        typeValue={tempTag.type}
        customValue={tempTag.custom}
        onTypeChange={(type) => setTempTag({ type, custom: "" })}
        onCustomChange={(custom) =>
          setTempTag((p) => ({ type: custom ? "Random" : p.type, custom }))
        }
        onClose={() => setShowTagModal(false)}
        onDone={() => {
          setData((p) => ({
            ...p,
            tagType: tempTag.type,
            tagCustom: tempTag.custom,
          }));
          setShowTagModal(false);
        }}
      />

      {showVersions && note && (
        <VersionHistoryModal
          noteId={note._id}
          currentNote={note}
          onClose={() => setShowVersions(false)}
          showAlert={showAlert}
        />
      )}

      <div className="ne-editor-page">
        <div className="ne-editor-card">
          <div className="ne-topbar">
            <button className="ne-topbar-btn" onClick={() => navigate(-1)}>
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
                      note?.isPinned ? " pinned" : ""
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

              <span
                className={`badge text-bg-${badgeColor}`}
                style={{ cursor: "pointer" }}
                onClick={() => setShowTagModal(true)}
              >
                {displayTag}
              </span>
            </div>
          </div>

          <input
            className="ne-title-input"
            value={data.title}
            onChange={(e) =>
              setData((p) => ({ ...p, title: e.target.value }))
            }
            placeholder="Untitled"
          />

          <div className="ne-desc-editor">
            <RichTextEditor
              value={data.description}
              onChange={(html) =>
                setData((p) => ({ ...p, description: html }))
              }
            />
          </div>
        </div>
      </div>

    </>
  );
};

export default NoteEditorPage;

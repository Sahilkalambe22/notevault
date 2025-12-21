// src/components/Notes.jsx

import React, { useContext, useEffect, useState } from "react";
import noteContext from "../context/notes/notesContext";
import NoteItem from "./NoteItem";
import NotesFilters from "./NotesFilters";
import ReminderManager from "./ReminderManager";
import { useNavigate } from "react-router-dom";

const Notes = (props) => {
  const context = useContext(noteContext);
  const { notes, getNotes } = context;
  const navigate = useNavigate();

  // 🔁 Fetch notes on mount (if logged in)
  useEffect(() => {
  let mounted = true;

  if (localStorage.getItem("token")) {
    mounted && getNotes();
  } else {
    navigate("/login");
  }

  return () => {
    mounted = false;
  };
},
// eslint-disable-next-line react-hooks/exhaustive-deps
[]);

  // open note editor
  const updateNote = (currentnote) => {
    navigate(`/note/${currentnote._id}`);
  };

  // create new note
  const handleAddNote = () => {
    navigate("/note/new");
  };

  // 🔍 SEARCH
  const [search, setsearch] = useState("");

  // 🏷 TAG FILTER
  const [selectedTag, setSelectedTag] = useState("");

  // unique tags
  const uniqueTags = Array.from(
    new Set(
      (notes || [])
        .map((n) => (n?.tag || "").toString().trim())
        .filter((t) => t !== "")
    )
  ).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" })
  );

  // filter notes
  const filteredNotes = (notes || []).filter((n) => {
    if (!n) return false;

    const s = search.trim().toLowerCase();
    const title = (n.title || "").trim().toLowerCase();
    const desc = (n.description || "").trim().toLowerCase();
    const tag = (n.tag || "").trim().toLowerCase();

    const matchesSearch =
      !s || title.includes(s) || desc.includes(s) || tag.includes(s);

    const matchesTag = selectedTag
      ? tag === selectedTag.trim().toLowerCase()
      : true;

    return matchesSearch && matchesTag;
  });

  // ⭐ pinned first
  const sortedNotes = filteredNotes.slice().sort((a, b) => {
    if (!!a.isPinned === !!b.isPinned) {
      return (a.tag || "").localeCompare(b.tag || "", undefined, {
        sensitivity: "base",
      });
    }
    return (b.isPinned === true) - (a.isPinned === true);
  });

  return (
    <>
      {/* 🔔 Background reminder handler */}
      <ReminderManager notes={notes} showAlert={props.showAlert} />

      <div className="container my-3 notes-page">

        {/* ================= STICKY HEADER ================= */}
        <div className="notes-sticky-header">

          {/* Title + actions */}
          <div className="d-flex justify-content-between align-items-center gap-2 mb-3" style={{paddingTop: '20px'}}>
            <h4 className="mb-0">Your Notes</h4>

            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn btn-outline-light btn-sm"
                onClick={handleAddNote}
                style={{
                  borderRadius: "999px",
                  backgroundColor: "white",
                  color: "black",
                }}
              >
                Add Note
              </button>

              <div
                className="card px-3 py-2 shadow-sm"
                style={{ borderRadius: "12px" }}
              >
                <span>📌 Total Notes: {notes.length}</span>
              </div>
            </div>
          </div>

          {/* Filters */}
          <NotesFilters
            selectedTag={selectedTag}
            onTagChange={setSelectedTag}
            uniqueTags={uniqueTags}
            search={search}
            onSearchChange={setsearch}
          />
        </div>

        {/* ================= SCROLLABLE NOTES ================= */}
        <div className="notes-scroll-area" style={{paddingTop: '10px'}}>
          <div className="row">
            {sortedNotes.length === 0 && "No notes to display"}

            {sortedNotes.map((noteItem) => (
              <NoteItem
                key={noteItem._id}
                updateNote={updateNote}
                note={{ ...noteItem }}
                showAlert={props.showAlert}
              />
            ))}
          </div>
        </div>

      </div>
    </>
  );
};

export default Notes;

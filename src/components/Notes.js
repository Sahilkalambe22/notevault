// src/components/Notes.jsx

import React, { useContext, useEffect, useRef, useState } from "react";
import noteContext from "../context/notes/notesContext";
import NoteItem from "./NoteItem";
import AddNote from "./AddNote";
import NotesFilters from "./NotesFilters";
import EditNoteModal from "./EditNoteModal";
import ReminderManager from "./ReminderManager";
import { useNavigate } from "react-router-dom";

const Notes = (props) => {
	const context = useContext(noteContext);
	const { notes, getNotes, editNote } = context;
	const navigate = useNavigate();

	// 🔁 Fetch notes on mount (if logged in)
	useEffect(() => {
		if (localStorage.getItem("token")) {
			getNotes();
		} else {
			navigate("/login");
		}
		// eslint-disable-next-line
	}, []);

	// refs for modal open/close buttons
	const ref = useRef(null); // open
	const refClose = useRef(null); // close

	// Note edit state (supports etagType + etagCustom)
	const [note, setnote] = useState({
		id: "",
		etitle: "",
		edescription: "",
		etag: "",
		etagType: "",
		etagCustom: "",
	});

	// predefined tags (same as AddNote)
	const tags = ["Work", "Random", "Important", "Todo", "Personal", "Priority"];

	// Bootstrap color map for types (for TagSelector)
	const tagColorMap = {
		Work: "primary",
		Random: "secondary",
		Important: "danger",
		Todo: "success",
		Personal: "light",
		Priority: "warning",
	};

	const updateNote = (currentnote) => {
		// decide how to pre-fill etagType / etagCustom based on existing saved tag
		const currentTag = (currentnote.tag || "").toString().trim();
		let etagType = "";
		let etagCustom = "";

		if (currentTag && tags.includes(currentTag)) {
			etagType = currentTag;
			etagCustom = "";
		} else if (currentTag) {
			etagType = "";
			etagCustom = currentTag;
		}

		setnote({
			id: currentnote._id,
			etitle: currentnote.title,
			edescription: currentnote.description, // HTML from DB
			etag: currentTag,
			etagType,
			etagCustom,
		});

		// open modal
		ref.current?.click();
	};

	const handleClick = (e) => {
		if (e) e.preventDefault();

		// prefer custom (trimmed), then type, then default to "Random"
		const computedCustom = (note.etagCustom || "").toString().trim();
		const finalTag = computedCustom || note.etagType || "Random";

		// validate title + description plain text length
		const plainDescription = (note.edescription || "").replace(/<[^>]+>/g, "").trim();

		if (note.etitle.trim().length < 5 || plainDescription.length < 10) {
			props.showAlert("Title must be ≥ 5 chars and Description must be ≥ 10 chars", "warning");
			return;
		}

		// call editNote with existing signature: (id, title, description, tag)
		editNote(note.id, note.etitle, note.edescription, finalTag);
		refClose.current?.click();
		props.showAlert("Updated Successfully", "success");
	};

	// 🔍 SEARCH
	const [search, setsearch] = useState("");

	// 🏷 TAG FILTER – dynamic
	const [selectedTag, setSelectedTag] = useState("");

	// unique tags from notes (ignore empty/null) + sort alphabetically (trimmed + unique)
	const uniqueTags = Array.from(new Set((notes || []).map((n) => (n?.tag || "").toString().trim()).filter((t) => t !== ""))).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

	// apply search + tag filter (robust: trim + lowercase comparisons)
	const filteredNotes = (notes || []).filter((n) => {
		if (!n) return false;
		const s = (search || "").toString().trim().toLowerCase();

		const title = (n.title || "").toString().trim().toLowerCase();
		const desc = (n.description || "").toString().trim().toLowerCase();
		const tag = (n.tag || "").toString().trim().toLowerCase();

		const matchesSearch = s === "" ? true : title.includes(s) || desc.includes(s) || tag.includes(s);
		const matchesTag = selectedTag ? tag === (selectedTag || "").toString().trim().toLowerCase() : true;

		return matchesSearch && matchesTag;
	});

	// ⭐ Sort: pinned notes first, then by tag alphabetically
	const sortedNotes = filteredNotes.slice().sort((a, b) => {
		if (!!a.isPinned === !!b.isPinned) {
			return (a.tag || "").toString().localeCompare((b.tag || "").toString(), undefined, {
				sensitivity: "base",
			});
		}
		return (b.isPinned === true) - (a.isPinned === true);
	});

	const [showAddNote, setShowAddNote] = useState(false);

	return (
		<>
			{/* 🔔 Background reminder handler */}
			<ReminderManager notes={notes} showAlert={props.showAlert} />

			{showAddNote && <AddNote showAlert={props.showAlert} />}

			{/* Edit Note Modal as separate component */}
			<EditNoteModal note={note} setnote={setnote} tags={tags} tagColorMap={tagColorMap} onSubmit={handleClick} openRef={ref} closeRef={refClose} />

			{/* NOTES + SEARCH + TAG FILTER */}
			<div className="container my-3">
				<div className="d-flex flex-column gap-3 mb-3">
					{/* Title + stats */}
					<div className="d-flex justify-content-between align-items-center gap-2">
						<h4 className="mb-0">Your Notes</h4>

						<div className="d-flex align-items-center gap-2">
							<button
								type="button"
								className="btn btn-outline-light btn-sm"
								onClick={() => setShowAddNote((prev) => !prev)}
								style={{
									borderRadius: "999px",
									backgroundColor: "white",
									color: "black",
								}}
							>
								{showAddNote ? "Close Add Note" : "Add Note"}
							</button>

							<div className="card px-3 py-2 shadow-sm" style={{ borderRadius: "12px" }}>
								<span>📌 Total Notes: {notes.length}</span>
							</div>
						</div>
					</div>

					{/* Filters row */}
					<NotesFilters selectedTag={selectedTag} onTagChange={setSelectedTag} uniqueTags={uniqueTags} search={search} onSearchChange={setsearch} />
				</div>

				<div className="row">
					<div className="container mx-2">{sortedNotes.length === 0 && "No notes to display"}</div>

					{sortedNotes.map((noteItem) => (
						<NoteItem key={noteItem._id} updateNote={updateNote} note={{ ...noteItem }} showAlert={props.showAlert} />
					))}
				</div>
			</div>
		</>
	);
};

export default Notes;

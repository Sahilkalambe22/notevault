// src/components/Notes.jsx

import React, { useContext, useEffect, useState } from "react";
import noteContext from "../context/notes/notesContext";
import NoteItem from "./NoteItem";
import NotesFilters from "./NotesFilters";
import ReminderManager from "./ReminderManager";
import NotesHeader from "./NotesHeader";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./Notes.css";

const Notes = (props) => {
	const context = useContext(noteContext);
	const { notes, getNotes } = context;
	const navigate = useNavigate();

	// 🔁 Fetch notes on mount (if logged in)
	useEffect(
		() => {
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
		[],
	);

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
	const uniqueTags = useMemo(() => {
		return Array.from(new Set((notes || []).map((n) => (n?.tag || "").toString().trim()).filter((t) => t !== ""))).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
	}, [notes]);

	// filter notes
	const filteredNotes = (notes || []).filter((n) => {
		if (!n) return false;

		const s = search.trim().toLowerCase();
		const title = (n.title || "").trim().toLowerCase();
		const desc = (n.description || "").trim().toLowerCase();
		const tag = (n.tag || "").trim().toLowerCase();

		const matchesSearch = !s || title.includes(s) || desc.includes(s) || tag.includes(s);

		const matchesTag = selectedTag ? tag === selectedTag.trim().toLowerCase() : true;

		return matchesSearch && matchesTag;
	});

	// ⭐ pinned first
const sortedNotes = filteredNotes;

	const stats = useMemo(() => {
		const pinned = notes.filter((n) => n.isPinned).length;
		const reminders = notes.filter((n) => n.reminderAt).length;

		return {
			total: notes.length,
			pinned,
			reminders,
			tags: uniqueTags.length,
		};
	}, [notes, uniqueTags]);

	return (
		<>
			{/* 🔔 Background reminder handler */}
			<ReminderManager notes={notes} showAlert={props.showAlert} />

			<div className="container my-3 notes-page">
				{/* ================= STICKY HEADER ================= */}
				<div className="notes-sticky-header">
					{/* ================= DASHBOARD STATS ROW ================= */}
					<div className="row mb-4">
						<div className="col-6 col-md-3 mb-3">
							<div className="dashboard-card">
								<h6>Total Notes</h6>
								<h3>{stats.total}</h3>
							</div>
						</div>

						<div className="col-6 col-md-3 mb-3">
							<div className="dashboard-card">
								<h6>Pinned Notes</h6>
								<h3>{stats.pinned}</h3>
							</div>
						</div>

						<div className="col-6 col-md-3 mb-3">
							<div className="dashboard-card">
								<h6>Active Reminders</h6>
								<h3>{stats.reminders}</h3>
							</div>
						</div>

						<div className="col-6 col-md-3 mb-3">
							<div className="dashboard-card">
								<h6>Tags Used</h6>
								<h3>{stats.tags}</h3>
							</div>
						</div>
					</div>

					{/* ================= HEADER + ADD NOTE ================= */}
					<NotesHeader totalNotes={stats.total} onAddNote={handleAddNote} />

					{/* Filters */}
					<NotesFilters selectedTag={selectedTag} onTagChange={setSelectedTag} uniqueTags={uniqueTags} search={search} onSearchChange={setsearch} />
				</div>

				{/* ================= SCROLLABLE NOTES ================= */}
				<div className="notes-scroll-area">
					<div className="row">
						{sortedNotes.length === 0 ? (
							<div className="col-12">
								<div className="empty-state-card">
									<div className="empty-icon">🗒️</div>

									<h5>{search || selectedTag ? "No matching notes found" : "No notes yet"}</h5>

									<p>{search || selectedTag ? "Try adjusting your filters or search keywords." : "Start by creating your first note."}</p>

									{!search && !selectedTag && (
										<button className="notes-add-btn mt-2" onClick={handleAddNote}>
											+ Create First Note
										</button>
									)}
								</div>
							</div>
						) : (
							sortedNotes.map((noteItem) => <NoteItem key={noteItem._id} updateNote={updateNote} note={{ ...noteItem }} showAlert={props.showAlert} />)
						)}
					</div>
				</div>
			</div>
		</>
	);
};

export default Notes;

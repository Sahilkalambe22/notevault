// src/components/Notes.jsx

import React, { useContext, useEffect, useState, useRef } from "react";
import noteContext from "../context/notes/notesContext";
import NoteItem from "./NoteItem";
import NotesFilters from "./NotesFilters";
import ReminderManager from "./ReminderManager";
import NotesHeader from "./NotesHeader";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./Notes.css";
import CardSkeleton from "./loaders/CardSkeleton";

const Notes = (props) => {
	const context = useContext(noteContext);
	const { notes, getNotes, usage, getUsage } = context;
	const navigate = useNavigate();

	const [loading, setLoading] = useState(true);

	// 🔁 Fetch notes on mount (if logged in)
	useEffect(() => {
		let mounted = true;

		const fetchNotes = async () => {
			if (localStorage.getItem("token")) {
				try {
					await getNotes();
					await getUsage();
				} finally {
					if (mounted) setLoading(false);
				}
			} else {
				navigate("/login");
			}
		};

		fetchNotes();

		return () => {
			mounted = false;
		};

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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
	const filteredNotes = useMemo(() => {
		const s = search.trim().toLowerCase();
		const selected = selectedTag.trim().toLowerCase();

		return (notes || []).filter((n) => {
			if (!n) return false;

			const title = (n.title || "").trim().toLowerCase();
			const desc = (n.description || "").trim().toLowerCase();
			const tag = (n.tag || "").trim().toLowerCase();

			const matchesSearch = !s || title.includes(s) || desc.includes(s) || tag.includes(s);

			const matchesTag = selected ? tag === selected : true;

			return matchesSearch && matchesTag;
		});
	}, [notes, search, selectedTag]);

	const highlightText = (text, search) => {
		if (!search) return text;

		const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		const regex = new RegExp(`(${escaped})`, "gi");

		return text.split(regex).map((part, i) =>
			part.toLowerCase() === search.toLowerCase() ? (
				<span
					key={i}
					style={{
						backgroundColor: "var(--highlight-bg)",
						color: "var(--highlight-text)",
						borderRadius: "4px",
						padding: "0 3px",
					}}
				>
					{part}
				</span>
			) : (
				part
			),
		);
	};

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

	const { searchNotes } = useContext(noteContext);

	const debounceRef = useRef(null);

	const handleSearchChange = (value) => {
		setsearch(value);

		clearTimeout(debounceRef.current);

		debounceRef.current = setTimeout(() => {
			searchNotes(value);
		}, 300);
	};

	return (
		<>
			{/* 🔔 Background reminder handler */}
			<ReminderManager notes={notes} showAlert={props.showAlert} />

			<div className="container my-3 notes-page">
				{/* ================= STICKY HEADER ================= */}
				<div className="notes-sticky-header">
					{/* ================= DASHBOARD STATS ROW ================= */}
					{/* ================= USAGE BAR ================= */}
					<div className="usage-card mb-4">
						<div className="usage-top">
							<span>{usage.plan === "pro" ? "Pro Plan – Unlimited Notes" : "Notes Usage"}</span>
							<span>{usage.plan === "pro" ? `${usage.used} / Unlimited` : `${usage.used} / ${usage.limit}`}</span>
						</div>

						<div className="usage-bar">
							<div
								className="usage-fill"
								style={{
									width: `${usage.plan === "pro" ? "100%" : (usage.used / usage.limit) * 100 + "%"}`,
								}}
							></div>
						</div>
					</div>
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
					<NotesFilters selectedTag={selectedTag} onTagChange={setSelectedTag} uniqueTags={uniqueTags} search={search} onSearchChange={handleSearchChange} />
				</div>

				{/* ================= SCROLLABLE NOTES ================= */}
				<div className="notes-scroll-area">
					<div className="row">
						{loading ? (
							<CardSkeleton count={6} />
						) : sortedNotes.length === 0 ? (
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
							sortedNotes.map((noteItem) => <NoteItem key={noteItem._id} updateNote={updateNote} note={noteItem} search={search} highlightText={highlightText} showAlert={props.showAlert} />)
						)}
					</div>
				</div>
			</div>
		</>
	);
};

export default Notes;

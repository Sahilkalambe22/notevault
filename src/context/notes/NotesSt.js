// src/context/NotesState.js

import React, { useState } from "react";
import noteContext from "./notesContext";
import { getCachedNotes, cacheNotes } from "../../offline/NoteCache";

const NotesState = (props) => {
	const host = "http://localhost:5000";
	const [notes, setnotes] = useState([]);

	// canonical predefined types (case-insensitive matching)
	const PREDEFINED_TYPES = ["Work", "Random", "Important", "Todo", "Personal", "Priority"];

	const deriveTagTypeFromTag = (tag) => {
		if (!tag || typeof tag !== "string") return "";
		const trimmed = tag.trim();
		const match = PREDEFINED_TYPES.find((t) => t.toLowerCase() === trimmed.toLowerCase());
		return match || "";
	};

	// GET ALL notes
const getNotes = async () => {
	try {
		// 1️⃣ Try to load cached notes first (instant UI, works offline)
		try {
			const cached = await getCachedNotes();
			if (Array.isArray(cached) && cached.length > 0) {
				setnotes(cached);
			}
		} catch (cacheErr) {
			console.warn("Failed to load cached notes:", cacheErr);
		}

		// 2️⃣ Then fetch fresh notes from backend
		const response = await fetch(`${host}/api/notes/fetchallnotes`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"auth-token": localStorage.getItem("token"),
			},
		});

		const json = await response.json();
		const arr = Array.isArray(json) ? json : json.notes || [];

		// annotate each note with frontend-only tagType if applicable
		const annotated = arr.map((n) => ({
			...n,
			tagType: deriveTagTypeFromTag(n.tag),
		}));

		// ⭐ Sort pinned first (pinned true first)
		const sorted = annotated
			.slice()
			.sort((a, b) => (b.isPinned === true) - (a.isPinned === true));

		setnotes(sorted);

		// 3️⃣ Cache sorted notes for offline use next time
		try {
			await cacheNotes(sorted);
		} catch (cacheErr) {
			console.warn("Failed to cache notes:", cacheErr);
		}
	} catch (err) {
		console.error("getNotes error:", err);
		// if backend fails, user will still see whatever we loaded from cache above
	}
};
 

	/**
	 * ADD note
	 * - tagType is frontend-only. We DO NOT send it to backend.
	 * - reminderAt (ISO string or null) IS sent to backend.
	 * - If server returns created note object we annotate it with tagType before adding to local state.
	 * - If server doesn't return created object, fallback to refresh via getNotes().
	 */
	const addNote = async (
		title,
		description,
		tag,
		imageFile,
		attachmentFiles = [],
		tagType = "",
		reminderAt = null // 👈 NEW
	) => {
		try {
			const formData = new FormData();
			formData.append("title", title);
			formData.append("description", description);
			formData.append("tag", tag || "");

			// 🔔 send reminder if present
			if (reminderAt) {
				formData.append("reminderAt", reminderAt);
			}

			if (imageFile) formData.append("image", imageFile);
			if (attachmentFiles && attachmentFiles.length) {
				attachmentFiles.forEach((f) => formData.append("attachments", f));
			}

			const response = await fetch(`${host}/api/notes/addnotes`, {
				method: "POST",
				headers: {
					"auth-token": localStorage.getItem("token"),
					// NOTE: don't set Content-Type when sending FormData
				},
				body: formData,
			});

			let created = null;
			try {
				created = await response.json();
			} catch (parseErr) {
				console.warn("Could not parse addnotes response as JSON", parseErr);
				created = null;
			}

			if (!response.ok) {
				console.error("addNote failed:", created);
				return null;
			}

			// the server might return the created note directly, or wrap it (created.note / created.data)
			const newNote = (created && (created._id ? created : created.note || created.data)) || null;

			if (newNote && newNote._id) {
				const annotated = {
					...newNote,
					// prefer explicit tagType passed from UI; otherwise derive from returned tag
					tagType: tagType && tagType.toString().trim() ? tagType.toString().trim() : deriveTagTypeFromTag(newNote.tag),
				};

				setnotes((prev) => {
					// avoid duplicates
					const exists = prev.some((n) => n._id === annotated._id);
					if (exists) return prev;
					const merged = [annotated, ...prev];
					return merged.slice().sort((a, b) => (b.isPinned === true) - (a.isPinned === true));
				});

				console.log("addNote: appended new note locally", annotated);
				return annotated;
			}

			// fallback: server did not return created note object; refresh list
			console.warn("addNote: server did not return created note — refreshing notes via getNotes()");
			await getNotes();
			return null;
		} catch (err) {
			console.error("addNote error:", err);
			return null;
		}
	};

	// DELETE note
	const deleteNote = async (id) => {
		try {
			const response = await fetch(`${host}/api/notes/deletenote/${id}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					"auth-token": localStorage.getItem("token"),
				},
			});
			if (!response.ok) {
				const errBody = await response.json().catch(() => ({}));
				console.error("deleteNote failed", errBody);
				return;
			}
			setnotes((prev) => prev.filter((note) => note._id !== id));
		} catch (err) {
			console.error("deleteNote error:", err);
		}
	};

	/**
	 * EDIT note
	 * - Accepts optional frontend-only tagType param to update local annotation.
	 * - We still only send title/description/tag to backend (no tagType).
	 */
	const editNote = async (id, title, description, tag, tagType = "") => {
		try {
			const response = await fetch(`${host}/api/notes/updatenote/${id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					"auth-token": localStorage.getItem("token"),
				},
				body: JSON.stringify({ title, description, tag }),
			});

			const result = await response.json();
			if (!response.ok) {
				console.error("editNote failed", result);
				return null;
			}

			setnotes((prev) =>
				prev.map((n) => {
					if (n._id === id) {
						const localTagType = tagType && tagType.toString().trim() ? tagType.toString().trim() : deriveTagTypeFromTag(tag);
						return { ...n, title, description, tag, tagType: localTagType };
					}
					return n;
				})
			);

			return result;
		} catch (err) {
			console.error("editNote error:", err);
			return null;
		}
	};

	// PIN / UNPIN note
	const pinNote = async (id, isPinned) => {
		try {
			const response = await fetch(`${host}/api/notes/updatenote/${id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					"auth-token": localStorage.getItem("token"),
				},
				body: JSON.stringify({ isPinned }),
			});

			const updated = await response.json();
			if (!response.ok) {
				console.error("pinNote failed", updated);
				return null;
			}

			setnotes((prev) => prev.map((n) => (n._id === id ? { ...n, isPinned: updated.isPinned } : n)));
			return updated;
		} catch (err) {
			console.error("pinNote error:", err);
			return null;
		}
	};

	// ---------------------------
	// Version history methods
	// ---------------------------

	/**
	 * getVersions(noteId)
	 * returns array of version objects (or [] on failure)
	 */
	const getVersions = async (noteId) => {
		try {
			const res = await fetch(`${host}/api/notes/${noteId}/versions`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"auth-token": localStorage.getItem("token"),
				},
			});
			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				console.error("getVersions failed", body);
				return [];
			}
			const data = await res.json();
			return Array.isArray(data) ? data : data.versions || [];
		} catch (err) {
			console.error("getVersions error:", err);
			return [];
		}
	};

	/**
	 * restoreVersion(noteId, versionId)
	 * - calls backend restore endpoint
	 * - refreshes notes list after successful restore
	 * - returns server response object or throws on failure
	 */
	const restoreVersion = async (noteId, versionId) => {
		try {
			const res = await fetch(`${host}/api/notes/${noteId}/restore/${versionId}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"auth-token": localStorage.getItem("token"),
				},
			});
			const body = await res.json().catch(() => ({}));
			if (!res.ok) {
				console.error("restoreVersion failed", body);
				throw new Error(body.error || body || "Restore failed");
			}
			// refresh notes so UI reflects restored content
			await getNotes();
			return body;
		} catch (err) {
			console.error("restoreVersion error:", err);
			throw err;
		}
	};

	return (
		<noteContext.Provider
			value={{
				notes,
				addNote,
				deleteNote,
				editNote,
				getNotes,
				pinNote,
				// versioning exposed to components
				getVersions,
				restoreVersion,
			}}
		>
			{props.children}
		</noteContext.Provider>
	);
};

export default NotesState;

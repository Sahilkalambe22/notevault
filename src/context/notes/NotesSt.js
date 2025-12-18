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
		const match = PREDEFINED_TYPES.find(
			(t) => t.toLowerCase() === trimmed.toLowerCase()
		);
		return match || "";
	};

	// =========================
	// GET ALL NOTES
	// =========================
	const getNotes = async () => {
		try {
			// 1️⃣ Load cached notes first (offline / instant UI)
			try {
				const cached = await getCachedNotes();
				if (Array.isArray(cached) && cached.length > 0) {
					setnotes(cached);
				}
			} catch (cacheErr) {
				console.warn("Failed to load cached notes:", cacheErr);
			}

			// 2️⃣ Fetch fresh notes from backend
			const response = await fetch(`${host}/api/notes/fetchallnotes`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"auth-token": localStorage.getItem("token"),
				},
			});

			const json = await response.json();
			const arr = Array.isArray(json) ? json : json.notes || [];

			// annotate each note with frontend-only tagType
			const annotated = arr.map((n) => ({
				...n,
				tagType: deriveTagTypeFromTag(n.tag),
			}));

			// ⭐ pinned first
			const sorted = annotated
				.slice()
				.sort((a, b) => (b.isPinned === true) - (a.isPinned === true));

			setnotes(sorted);

			// 3️⃣ Cache notes
			try {
				await cacheNotes(sorted);
			} catch (cacheErr) {
				console.warn("Failed to cache notes:", cacheErr);
			}
		} catch (err) {
			console.error("getNotes error:", err);
		}
	};

	// =========================
	// ADD NOTE
	// =========================
	const addNote = async (
		title,
		description,
		tag,
		imageFile,
		attachmentFiles = [],
		tagType = "",
		reminderAt = null
	) => {
		try {
			const formData = new FormData();
			formData.append("title", title);
			formData.append("description", description);
			formData.append("tag", tag || "");

			if (reminderAt) {
				formData.append("reminderAt", reminderAt);
			}

			if (imageFile) formData.append("image", imageFile);
			if (attachmentFiles?.length) {
				attachmentFiles.forEach((f) =>
					formData.append("attachments", f)
				);
			}

			const response = await fetch(`${host}/api/notes/addnotes`, {
				method: "POST",
				headers: {
					"auth-token": localStorage.getItem("token"),
				},
				body: formData,
			});

			let created = null;
			try {
				created = await response.json();
			} catch {
				created = null;
			}

			if (!response.ok) {
				console.error("addNote failed:", created);
				return null;
			}

			const newNote =
				(created && (created._id ? created : created.note || created.data)) ||
				null;

			if (newNote && newNote._id) {
				const annotated = {
					...newNote,
					tagType:
						tagType?.trim() ||
						deriveTagTypeFromTag(newNote.tag),
				};

				setnotes((prev) => {
					if (prev.some((n) => n._id === annotated._id)) return prev;
					return [annotated, ...prev].sort(
						(a, b) => (b.isPinned === true) - (a.isPinned === true)
					);
				});

				return annotated;
			}

			await getNotes();
			return null;
		} catch (err) {
			console.error("addNote error:", err);
			return null;
		}
	};

	// =========================
	// DELETE NOTE
	// =========================
	const deleteNote = async (id) => {
		try {
			const response = await fetch(`${host}/api/notes/deletenote/${id}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					"auth-token": localStorage.getItem("token"),
				},
			});

			if (!response.ok) return;

			setnotes((prev) => prev.filter((note) => note._id !== id));
		} catch (err) {
			console.error("deleteNote error:", err);
		}
	};

	// =========================
	// EDIT NOTE
	// =========================
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
			if (!response.ok) return null;

			setnotes((prev) =>
				prev.map((n) =>
					n._id === id
						? {
								...n,
								title,
								description,
								tag,
								tagType:
									tagType?.trim() ||
									deriveTagTypeFromTag(tag),
						  }
						: n
				)
			);

			return result;
		} catch (err) {
			console.error("editNote error:", err);
			return null;
		}
	};

	// =========================
	// PIN / UNPIN NOTE
	// =========================
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
			if (!response.ok) return null;

			setnotes((prev) =>
				prev.map((n) =>
					n._id === id ? { ...n, isPinned: updated.isPinned } : n
				)
			);

			return updated;
		} catch (err) {
			console.error("pinNote error:", err);
			return null;
		}
	};

	// =========================
	// VERSION HISTORY
	// =========================
	const getVersions = async (noteId) => {
		try {
			const res = await fetch(`${host}/api/notes/${noteId}/versions`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"auth-token": localStorage.getItem("token"),
				},
			});

			if (!res.ok) return [];
			const data = await res.json();
			return Array.isArray(data) ? data : data.versions || [];
		} catch (err) {
			console.error("getVersions error:", err);
			return [];
		}
	};

	const restoreVersion = async (noteId, versionId) => {
		try {
			const res = await fetch(
				`${host}/api/notes/${noteId}/restore/${versionId}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"auth-token": localStorage.getItem("token"),
					},
				}
			);

			if (!res.ok) throw new Error("Restore failed");
			await getNotes();
			return true;
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
				getVersions,
				restoreVersion,
			}}
		>
			{props.children}
		</noteContext.Provider>
	);
};

export default NotesState;

import React, { useContext } from "react";
import noteContext from "../context/notes/notesContext";
import PinButton from "./PinButton";
import ReminderBadge from "./ReminderBadge";
import "./NoteItem.css";

/* ================= TAG CONFIG ================= */

const TAG_COLOR_MAP = {
	Work: { bg: "#2563eb", text: "#ffffff" }, // blue
	Important: { bg: "#ef4444", text: "#ffffff" }, // red
	Personal: { bg: "#8b5cf6", text: "#ffffff" }, // purple
	Todo: { bg: "#16a34a", text: "#ffffff" }, // green
	Priority: { bg: "#facc15", text: "#000000" }, // yellow
	Random: { bg: "#6b7280", text: "#ffffff" }, // gray
};

const TAG_ICON_MAP = {
	Work: "fa-solid fa-briefcase",
	Important: "fa-solid fa-triangle-exclamation",
	Personal: "fa-solid fa-user",
	Todo: "fa-solid fa-list-check",
	Random: "fa-solid fa-shuffle",
	Priority: "fa-solid fa-bolt",
};

const host = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
/* ================= COMPONENT ================= */

const NoteItem = ({ note, updateNote, showAlert }) => {
	const { deleteNote, pinNote } = useContext(noteContext);

	/* ================= TAG NORMALIZATION ================= */

	const rawTag = (note.tag || "Random").trim();
	const normalizedTag = rawTag.toLowerCase();

	const canonicalTag = Object.keys(TAG_COLOR_MAP).find((t) => t.toLowerCase() === normalizedTag);

	const effectiveTag = canonicalTag || "Random";
	const badgeColor = TAG_COLOR_MAP[effectiveTag];
	const tagIconClass = TAG_ICON_MAP[effectiveTag] || null;
	const displayTag = canonicalTag || rawTag;

	/* ================= ACTIONS ================= */

	const handleDelete = (e) => {
		e.stopPropagation();
		if (!window.confirm("Delete this note permanently?")) return;

		deleteNote(note._id);
		showAlert("Deleted successfully", "success");
	};

	const handlePin = (e) => {
		e.stopPropagation();
		pinNote(note._id, !note.isPinned);

		showAlert(note.isPinned ? "Note unpinned" : "Note pinned", "success");
	};

	const handleShare = async (e) => {
		e.stopPropagation();

		try {
			const res = await fetch(`${host}/api/notes/${note._id}/share`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			});

			const data = await res.json();

			if (data.shareUrl) {
				await navigator.clipboard.writeText(data.shareUrl);
				showAlert("Share link copied!", "success");
			} else {
				showAlert("Unable to create share link", "danger");
			}
		} catch (err) {
			console.error(err);
			showAlert("Share failed", "danger");
		}
	};

	const handleOpenNote = () => {
		updateNote(note);
	};

	const getPreviewText = (html) => {
		if (!html) return "";

		return html
			.replace(/<[^>]+>/g, "") // remove HTML tags
			.replace(/&nbsp;/g, " ") // convert non-breaking spaces
			.replace(/\s+/g, " ") // normalize spaces
			.trim();
	};

	/* ================= RENDER ================= */

	return (
		<div className="col-xl-4 col-lg-4 col-md-6 col-sm-12 mb-4">
			<div className={`card note-card h-100 d-flex flex-column position-relative ${note.isPinned ? "note-pinned" : ""}`}>
				{/* PIN BUTTON */}
				<PinButton isPinned={note.isPinned} onToggle={handlePin} />

				{/* MAIN CONTENT */}
				<div className="flex-grow-1 p-4 note-clickable" onClick={handleOpenNote}>
					{/* TAG + REMINDER */}
					<div className="d-flex justify-content-between align-items-center mb-3 gap-2">
						<span
							className="badge rounded-pill d-inline-flex align-items-center"
							style={{
								backgroundColor: badgeColor.bg,
								color: badgeColor.text,
								gap: "6px",
								padding: "6px 12px",
								fontSize: "0.75rem",
								fontWeight: "500",
							}}
						>
							{tagIconClass && <i className={`${tagIconClass}`} />}
							{displayTag}
						</span>

						<ReminderBadge reminderAt={note.reminderAt} />
					</div>

					{/* TITLE */}
					<h6 className="fw-semibold mb-3 note-title">{note.title?.trim() || "Untitled"}</h6>

					{/* DESCRIPTION PREVIEW */}
					<div className="note-preview-text">{getPreviewText(note.description).slice(0, 200)}</div>
				</div>

				{/* FOOTER */}
				<div className="note-footer d-flex justify-content-end align-items-center px-3 py-2 gap-3">
					<button className="note-icon text-primary" onClick={handleShare}>
						<i className="fa-solid fa-share-nodes" />
					</button>
					<button className="note-icon text-danger" onClick={handleDelete}>
						<i className="fa-solid fa-trash-can" />
					</button>
				</div>
			</div>
		</div>
	);
};

export default NoteItem;

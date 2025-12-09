// src/components/NoteItem.js

import React, { useContext } from "react";
import noteContext from "../context/notes/notesContext";
import PinButton from "./PinButton";
import ReminderBadge from "./ReminderBadge";
import VersionHistoryModal from "./VersionHistoryModal"; // <-- new import

const NoteItem = (props) => {
	const context = useContext(noteContext);
	const { deleteNote, pinNote } = context;
	const { note, updateNote } = props;

	const [showImageModal, setShowImageModal] = React.useState(false);
	const [showVersions, setShowVersions] = React.useState(false); // <-- new state
	const host = "http://localhost:5000";

	// canonical predefined tag types (canonical casing)
	const tagTypes = ["Work", "Random", "Important", "Todo", "Personal", "Priority"];

	// map canonical type -> bootstrap variant
	const tagTypeToVariant = {
		work: "primary",
		random: "secondary",
		important: "danger",
		todo: "success",
		personal: "light", // will add text-dark class for readability
		priority: "warning",
	};

	// icon map (same idea as TagSelector)
	const TAG_ICON_MAP = {
		Work: "fa-solid fa-briefcase",
		Important: "fa-solid fa-triangle-exclamation",
		Personal: "fa-solid fa-user",
		Todo: "fa-solid fa-list-check",
		Random: "fa-solid fa-shuffle",
		Priority: "fa-solid fa-bolt",
	};

	// fallback variants for custom tags (avoid 'light' for custom to keep contrast simple)
	const customVariants = ["primary", "secondary", "success", "danger", "warning", "info", "dark"];

	// simple deterministic hash to pick a variant index for a custom tag
	const deterministicIndex = (str, mod) => {
		let h = 0;
		for (let i = 0; i < str.length; i++) {
			h = (h * 31 + str.charCodeAt(i)) >>> 0;
		}
		return h % mod;
	};

	// Normalise saved tag (string trimmed)
	const savedTagRaw = (note.tag || "").toString();
	const savedTag = savedTagRaw.trim();

	// If backend provides tagType explicitly (future-proof) and it's non-empty, prefer it
	const explicitType = note.tagType && typeof note.tagType === "string" && note.tagType.trim() !== "" ? note.tagType.trim() : "";

	// Try to match savedTag to one of the canonical types (case-insensitive)
	const matchedType = (() => {
		if (explicitType) return explicitType; // prefer explicit field
		if (!savedTag) return "";
		const lower = savedTag.toLowerCase();
		const match = tagTypes.find((t) => t.toLowerCase() === lower);
		return match || "";
	})();

	// Decide bootstrap variant
	const variant = (() => {
		if (matchedType) {
			return tagTypeToVariant[matchedType.toLowerCase()] || "secondary";
		}
		if (savedTag !== "") {
			const idx = deterministicIndex(savedTag.toLowerCase(), customVariants.length);
			return customVariants[idx];
		}
		return "secondary";
	})();

	// Extra classes for contrast (light badges need dark text)
	const extraClasses = variant === "light" ? " text-dark" : "";

	// Label to display: prefer saved tag (final label) but fallback to matchedType or "Random"
	const displayLabel = savedTag !== "" ? savedTag : matchedType || "Random";

	// Icon to display – based on canonical type
	const tagIconClass = TAG_ICON_MAP[matchedType] || null;

	return (
		<div className="col-md-3 mb-3">
			<div className="card shadow-sm h-100 d-flex flex-column position-relative" style={{ backgroundColor: "#f3ebc3ff" }}>
				{/* PIN ICON */}
				<PinButton
					isPinned={note.isPinned}
					onToggle={() => {
						pinNote(note._id, !note.isPinned);
						props.showAlert(note.isPinned ? "Note unpinned" : "Note pinned", "success");
					}}
				/>

				{/* CONTENT */}
				<div className="flex-grow-1 p-3" style={{ overflowY: "auto", maxHeight: "230px" }}>
					{/* Tag + Reminder row */}
					<div className="d-flex justify-content-between align-items-center mb-1 gap-2">
						<small
							className={`badge text-bg-${variant}${extraClasses}`}
							style={{
								borderRadius: "999px",
								padding: "0.25rem 0.6rem",
								display: "inline-flex",
								alignItems: "center",
								gap: "6px",
							}}
						>
							{tagIconClass && <i className={tagIconClass}></i>}
							{displayLabel}
						</small>

						{/* ⏰ Reminder badge (if any) */}
						<ReminderBadge reminderAt={note.reminderAt} />
					</div>

					<h5 className="card-title mt-1 mb-1">{note.title}</h5>

					{/* RICH DESCRIPTION (HTML) */}
					<div className="card-text mb-2" dangerouslySetInnerHTML={{ __html: note.description || "" }} />

					{/* IMAGE */}
					{note.imagePath && (
						<div className="mt-1 mb-2">
							<img
								src={`${host}${note.imagePath}`}
								alt={note.imageOriginalName || "note image"}
								className="img-fluid rounded"
								style={{
									maxHeight: "120px",
									objectFit: "cover",
									width: "100%",
									cursor: "pointer",
								}}
								onClick={() => setShowImageModal(true)}
							/>
						</div>
					)}
				</div>

				{/* FOOTER ICONS */}
				<div className="p-2 border-top d-flex justify-content-start gap-3" style={{ backgroundColor: "#f3ebc3ff" }}>
					<i className="fa-solid fa-user-pen" style={{ cursor: "pointer" }} onClick={() => updateNote(note)}></i>

					<i
						className="fa-solid fa-trash-can"
						style={{ cursor: "pointer" }}
						onClick={() => {
							deleteNote(note._id);
							props.showAlert("Deleted successfully", "success");
						}}
					></i>

					{note.attachments && note.attachments.length > 0 && (
						<div className="d-flex align-items-center gap-2">
							{note.attachments.map((file, idx) => (
								<i
									key={idx}
									className="fa-solid fa-link"
									style={{ cursor: "pointer" }}
									title={file.originalName || `Attachment ${idx + 1}`}
									onClick={() => {
										window.open(`${host}${file.path}`, "_blank", "noopener,noreferrer");
									}}
								></i>
							))}
						</div>
					)}

					{/* VERSION HISTORY ICON */}
					<i className="fa-solid fa-clock-rotate-left" title="Version history" style={{ cursor: "pointer", marginLeft: "4px" }} onClick={() => setShowVersions(true)}></i>
				</div>

				{/* IMAGE MODAL */}
				{note.imagePath && showImageModal && (
					<div className="modal fade show d-block" tabIndex="-1" onClick={() => setShowImageModal(false)} style={{ background: "rgba(0, 0, 0, 0.7)" }}>
						<div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
							<div className="modal-content bg-transparent border-0">
								<img src={`${host}${note.imagePath}`} alt={note.imageOriginalName || "note image"} className="img-fluid rounded" />
							</div>
						</div>
					</div>
				)}

				{/* VERSION HISTORY MODAL */}
				{showVersions && <VersionHistoryModal noteId={note._id} currentNote={note} onClose={() => setShowVersions(false)} showAlert={props.showAlert} />}
			</div>
		</div>
	);
};

export default NoteItem;

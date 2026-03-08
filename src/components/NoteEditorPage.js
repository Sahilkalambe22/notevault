import React, { lazy, Suspense, useContext, useEffect, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";
import noteContext from "../context/notes/notesContext";

import ReminderBadge from "./ReminderBadge";
import EditorSkeleton from "./loaders/EditorSkeleton";

import "./NoteEditorPage.css";

/* ================= LAZY COMPONENTS ================= */

const TagSelectorModal = lazy(() => import("./TagSelectorModal"));
const RichTextEditor = lazy(() => import("./RichTextEditor"));
const VersionHistoryModal = lazy(() => import("./VersionHistoryModal"));
const ReminderModal = lazy(() => import("./ReminderModal"));

/* ================= TAG CONFIG ================= */

const TAGS = ["Work", "Random", "Important", "Todo", "Personal", "Priority"];

const TAG_ICON_MAP = {
	Work: "fa-solid fa-briefcase",
	Important: "fa-solid fa-triangle-exclamation",
	Personal: "fa-solid fa-user",
	Todo: "fa-solid fa-list-check",
	Priority: "fa-solid fa-bolt",
	Random: "fa-solid fa-shuffle",
};

const TAG_COLOR_MAP = {
	Work: { bg: "#2563eb", text: "#ffffff" },
	Important: { bg: "#ef4444", text: "#ffffff" },
	Personal: { bg: "#8b5cf6", text: "#ffffff" },
	Todo: { bg: "#16a34a", text: "#ffffff" },
	Priority: { bg: "#facc15", text: "#000000" },
	Random: { bg: "#6b7280", text: "#ffffff" },
};

const NoteEditorPage = ({ note, showAlert }) => {
	const navigate = useNavigate();
	const { addNote, editNote, deleteNote, pinNote, updateReminder } = useContext(noteContext);

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
	const [showReminderModal, setShowReminderModal] = useState(false);

	const [loading, setLoading] = useState(!isNew);

	/* ================= LOAD EXISTING NOTE ================= */

	useEffect(() => {
		if (!note) return;

		setLoading(false);

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

	/* ================= REMINDER ================= */

	const handleSetReminder = async (date) => {
		if (!note?._id) return;

		await updateReminder(note._id, date);
		showAlert("Reminder set", "success");
	};

	const handleRemoveReminder = async () => {
		if (!note?._id) return;

		await updateReminder(note._id, null);
		showAlert("Reminder removed", "info");
	};

	/* ================= AUTOSAVE ================= */

	useEffect(() => {
		const plainDesc = data.description.replace(/<[^>]+>/g, "").trim();
		if (!data.title.trim() && !plainDesc) return;

		clearTimeout(saveTimer.current);

		saveTimer.current = setTimeout(async () => {
			const resolvedTag = data.tagCustom || data.tagType || "Random";

			/* CREATE NOTE FIRST TIME */

			if (isNew && !createdOnceRef.current && !createdNoteIdRef.current) {
				setIsSaving(true);

				const created = await addNote(data.title || "Untitled", data.description, resolvedTag);

				if (created?._id) {
					createdOnceRef.current = true;
					createdNoteIdRef.current = created._id;

					navigate(`/note/${created._id}`, { replace: true });
				}

				setIsSaving(false);
				return;
			}

			const noteId = createdNoteIdRef.current || note?._id;
			if (!noteId) return;

			if (data.title === lastSaved.title && data.description === lastSaved.description && resolvedTag === lastSaved.tag) return;

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

		const newPinnedState = !note.isPinned;

		pinNote(note._id, newPinnedState);

		showAlert(newPinnedState ? "Note pinned" : "Note unpinned", "success");
	};

	const displayTag = data.tagCustom || data.tagType || originalTagRef.current || "Random";

	const effectiveTag = data.tagType || "Random";
	const tagIcon = TAG_ICON_MAP[effectiveTag];

	/* ================= SKELETON ================= */

	if (loading && !isNew) {
		return <EditorSkeleton />;
	}

	/* ================= RENDER ================= */

	return (
		<>
			{/* TAG MODAL */}

			<Suspense fallback={null}>
				<TagSelectorModal
					show={showTagModal}
					tags={TAGS}
					tagColorMap={TAG_COLOR_MAP}
					typeValue={tempTag.type}
					customValue={tempTag.custom}
					onTypeChange={(type) => setTempTag({ type, custom: "" })}
					onCustomChange={(custom) =>
						setTempTag((p) => ({
							type: custom ? "Random" : p.type,
							custom,
						}))
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
			</Suspense>

			{/* REMINDER MODAL */}

			<Suspense fallback={null}>
				<ReminderModal
					show={showReminderModal}
					initialValue={note?.reminderAt}
					onClose={() => setShowReminderModal(false)}
					onSave={async (isoDate) => {
						await handleSetReminder(isoDate);
						setShowReminderModal(false);
					}}
					onRemove={async () => {
						await handleRemoveReminder();
						setShowReminderModal(false);
					}}
				/>
			</Suspense>

			{/* VERSION HISTORY */}

			{showVersions && note && (
				<Suspense fallback={<EditorSkeleton />}>
					<VersionHistoryModal noteId={note._id} currentNote={note} onClose={() => setShowVersions(false)} showAlert={showAlert} />
				</Suspense>
			)}

			<div className="ne-editor-page">
				<div className="ne-editor-card">
					<div className="ne-topbar">
						<button className="ne-topbar-btn" onClick={() => navigate(-1)}>
							<i className="fa-solid fa-arrow-left" />
						</button>

						<span className={`save-indicator ${isSaving ? "saving" : "saved"}`}>{isSaving ? "Saving..." : "Saved"}</span>

						<div className="ne-topbar-right">
							<ReminderBadge reminderAt={note?.reminderAt} />

							{!isNew && (
								<>
									<i className={`fa-regular fa-clock editor-action ${note?.reminderAt ? "active-reminder" : ""}`} onClick={() => setShowReminderModal(true)} />

									<i className={`fa-solid fa-thumbtack editor-action${note?.isPinned ? " pinned" : ""}`} onClick={handlePin} />

									<i className="fa-solid fa-clock-rotate-left editor-action" onClick={() => setShowVersions(true)} />

									<i className="fa-solid fa-trash-can editor-action" style={{ color: "#ef4444" }} onClick={handleDelete} />
								</>
							)}

							<span className={`editor-tag-badge tag-${effectiveTag.toLowerCase()}`} onClick={() => setShowTagModal(true)}>
								{tagIcon && <i className={tagIcon}></i>}
								{displayTag}
							</span>
						</div>
					</div>

					<input
						className="ne-title-input"
						value={data.title}
						onChange={(e) =>
							setData((p) => ({
								...p,
								title: e.target.value,
							}))
						}
						placeholder="Untitled"
					/>

					<div className="ne-desc-editor">
						<Suspense fallback={<div className="skeleton skeleton-editor"></div>}>
							<RichTextEditor
								value={data.description}
								onChange={(html) =>
									setData((p) => ({
										...p,
										description: html,
									}))
								}
							/>
						</Suspense>
					</div>
				</div>
			</div>
		</>
	);
};

export default NoteEditorPage;

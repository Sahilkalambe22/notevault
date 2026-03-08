import React, { useRef, useContext, useState, useEffect } from "react";
import noteContext from "../context/notes/notesContext";
import ListSkeleton from "./loaders/ListSkeleton";

import "./NoteAttachmentsPanel.css";

const NoteAttachmentsPanel = ({ note, showAlert }) => {
	const fileRef = useRef(null);
	const host = "http://localhost:5000";

	const { replaceNote } = useContext(noteContext);
	const [loading, setLoading] = useState(!note);

	useEffect(() => {
		if (note) {
			setLoading(false);
		}
	}, [note]);

	const handleUpload = async (files) => {
		if (!note?._id || !files?.length) return;

		try {
			const formData = new FormData();
			files.forEach((f) => formData.append("attachments", f));

			const res = await fetch(`${host}/api/notes/updatenote/${note._id}`, {
				method: "PUT",
				headers: {
					"auth-token": localStorage.getItem("token"),
				},
				body: formData,
			});

			if (!res.ok) throw new Error("Upload failed");

			const updatedNote = await res.json();

			// 🔑 only sync state
			replaceNote(updatedNote);

			showAlert("Attachment added", "success");
		} catch (err) {
			console.error(err);
			showAlert("Upload failed", "danger");
		}
	};

	const handleRemove = async (index) => {
		if (!note?._id) return;

		try {
			const res = await fetch(`${host}/api/notes/${note._id}/attachments/${index}`, {
				method: "DELETE",
				headers: {
					"auth-token": localStorage.getItem("token"),
				},
			});

			if (!res.ok) throw new Error("Delete failed");

			const updatedNote = await res.json();

			replaceNote(updatedNote);

			showAlert("Attachment removed", "success");
		} catch (err) {
			console.error(err);
			showAlert("Remove failed", "danger");
		}
	};

	return (
		<div className="nv-attachments">
			<div className="nv-attachments-header">
				<span>
					<i className="fa-solid fa-paperclip"></i> Attachments
				</span>

				<button className="nv-add-btn" onClick={() => fileRef.current.click()}>
					<i className="fa-solid fa-plus"></i>
				</button>
			</div>

			<input ref={fileRef} type="file" multiple hidden onChange={(e) => handleUpload([...e.target.files])} />

			<div className="nv-attachments-list">
				{loading ? (
					<ListSkeleton count={3} />
				) : !note?.attachments?.length ? (
					<div className="nv-empty">No attachments yet</div>
				) : (
					note.attachments.map((a, i) => (
						<div className="nv-attachment-chip" key={a.path || i}>
							<div className="nv-file-info">
								<i className="fa-solid fa-file"></i>
								<span>{a.originalName}</span>
							</div>

							<div className="nv-file-actions">
								<a href={`${host}${a.path}`} target="_blank" rel="noopener noreferrer">
									<i className="fa-solid fa-arrow-up-right-from-square"></i>
								</a>

								<button onClick={() => handleRemove(i)}>
									<i className="fa-solid fa-xmark"></i>
								</button>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
};

export default NoteAttachmentsPanel;

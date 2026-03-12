import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../NoteEditorPage.css";
import "./SharedNote.css";

const host = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const SharedNote = () => {
	const { id } = useParams();
	const [note, setNote] = useState(null);

	useEffect(() => {
		const fetchNote = async () => {
			const res = await fetch(`${host}/api/notes/public/${id}`);
			const data = await res.json();
			setNote(data);
		};

		fetchNote();
	}, [id]);

	if (!note) return <p>Loading...</p>;

	return (
		<div className="mt-4">
			<div className="ne-editor-page">
				<div className="ne-editor-card">
					<div className="shared-badge">
						<i className="fa-solid fa-globe"></i>
						Public Note
					</div>

					{/* TITLE */}
					<h1 className="ne-title-input shared-title">{note.title}</h1>

					{/* CONTENT */}
					<div className="ne-desc-editor shared-note-content" dangerouslySetInnerHTML={{ __html: note.description }} />
				</div>
			</div>
		</div>
	);
};

export default SharedNote;

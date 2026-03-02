// src/components/VersionHistoryModal.js

import React, { useEffect, useState, useContext } from "react";
import noteContext from "../context/notes/notesContext";
import DiffViewer from "./DiffViewer";
import NotePreview from "./NotePreview";
import "./VersionHistoryModal.css";

const VersionHistoryModal = ({ noteId, currentNote = {}, onClose, showAlert }) => {
	const { getVersions, restoreVersion } = useContext(noteContext);

	const [versions, setVersions] = useState([]);
	const [selected, setSelected] = useState(null);
	const [loading, setLoading] = useState(false);
	const [restoring, setRestoring] = useState(false);

	/* LOAD VERSIONS */
	useEffect(() => {
		let mounted = true;

		(async () => {
			if (!noteId) return;

			setLoading(true);
			try {
				const v = await getVersions(noteId);
				if (mounted) setVersions(v);
			} catch (err) {
				console.error(err);
				showAlert?.("Failed to load versions", "danger");
			} finally {
				setLoading(false);
			}
		})();

		return () => (mounted = false);
	}, [noteId, getVersions, showAlert]);

	/* RESTORE */
	const handleRestore = async (versionId) => {
		if (!window.confirm("Restore this version? A backup will be saved.")) return;

		try {
			setRestoring(true);
			await restoreVersion(noteId, versionId);
			showAlert?.("Version restored", "success");
			onClose();
		} catch (err) {
			console.error(err);
			showAlert?.("Restore failed", "danger");
		} finally {
			setRestoring(false);
		}
	};

	return (
		<div className="vh-fullscreen">
			<div className="vh-container">
				{/* LEFT TIMELINE */}
				<aside className="vh-timeline">
					<div className="vh-timeline-header">Version history</div>

					<div className="vh-timeline-list">
						{loading ? (
							<div className="vh-muted">Loading…</div>
						) : versions.length === 0 ? (
							<div className="vh-muted">No versions found.</div>
						) : (
							versions.map((v) => (
								<div key={v._id} className={`vh-timeline-item ${selected?._id === v._id ? "active" : ""}`} onClick={() => setSelected(v)}>
									<div className="vh-dot" />
									<div className="vh-item-content">
										<div className="vh-version-title">{v.title || "(no title)"}</div>
										<div className="vh-version-time">{new Date(v.savedAt).toLocaleString()}</div>
									</div>
								</div>
							))
						)}
					</div>
				</aside>

				{/* RIGHT DIFF PANEL */}
				<main className="vh-diff-panel">
					<div className="vh-diff-header">
						<div className="vh-diff-meta">
							{selected ? (
								<>
									Comparing with:
									<strong> {new Date(selected.savedAt).toLocaleString()}</strong>
								</>
							) : (
								<span className="vh-muted">Select a version to compare</span>
							)}
						</div>

						<div className="vh-header-actions">
							{selected && (
								<button className="vh-restore" onClick={() => handleRestore(selected._id)} disabled={restoring}>
									{restoring ? "Restoring…" : "Restore version"}
								</button>
							)}

							<button className="vh-close" onClick={onClose}>
								✕
							</button>
						</div>
					</div>

					<div className="vh-diff-body">
						{selected ? (
							<>
								{/* Full visual preview exactly like real note */}
								<div className="vh-note-preview">
									<NotePreview note={selected} isPreviewMode />
								</div>

								{/* Optional diff below */}
								<div className="vh-diff-section">
									<DiffViewer oldText={selected.description} newText={currentNote.description} />
								</div>
							</>
						) : (
							<div className="vh-empty-state">No version selected.</div>
						)}
					</div>
				</main>
			</div>
		</div>
	);
};

export default VersionHistoryModal;

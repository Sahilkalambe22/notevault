// src/components/VersionHistoryModal.js
import React, { useEffect, useState, useContext, useRef } from "react";
import noteContext from "../context/notes/notesContext";

/**
 * Render a note card consistent with your NoteItem styling.
 * We keep it compact and readable for non-technical users.
 */
const NoteCardMini = ({ noteData, host = "http://localhost:5000" }) => {
	if (!noteData) return null;

	const savedTag = (noteData.tag || "").toString().trim();
	// small badge variant logic: keep simple
	const variant = savedTag ? "secondary" : "secondary";
	const extraClasses = variant === "light" ? " text-dark" : "";

	return (
		<div className="card shadow-sm h-100" style={{ backgroundColor: "#f3ebc3ff" }}>
			<div className="card-body" style={{ overflow: "hidden" }}>
				<div className="d-flex justify-content-between align-items-start mb-2">
					<small className={`badge text-bg-${variant}${extraClasses}`} style={{ borderRadius: 999, padding: "0.25rem 0.6rem" }}>
						{savedTag || "No tag"}
					</small>
					<small style={{ fontSize: 12, color: "#666" }}>{noteData.reminderAt ? new Date(noteData.reminderAt).toLocaleString() : ""}</small>
				</div>

				<h5 className="card-title" style={{ marginBottom: 8 }}>
					{noteData.title || "(no title)"}
				</h5>

				{/* Description (rendered HTML) */}
				<div style={{ minHeight: 80, maxHeight: 160, overflowY: "auto" }}>
					<div dangerouslySetInnerHTML={{ __html: noteData.description || "" }} />
				</div>

				{/* Image */}
				{noteData.imagePath && (
					<div className="mt-2">
						<img src={`${host}${noteData.imagePath}`} alt={noteData.imageOriginalName || "image"} className="img-fluid rounded" style={{ maxHeight: 120, width: "100%", objectFit: "cover" }} />
					</div>
				)}

				{/* Attachments */}
				{noteData.attachments && noteData.attachments.length > 0 && (
					<div className="mt-2">
						<small className="text-muted">Attachments:</small>
						<div className="d-flex gap-2 flex-wrap mt-1">
							{noteData.attachments.map((a, i) => (
								<a key={i} href={`${a.path.startsWith("http") ? a.path : a.path}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-secondary">
									{a.originalName || `File ${i + 1}`}
								</a>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

const VersionHistoryModal = ({ noteId, currentNote = {}, onClose, showAlert }) => {
	const { getVersions, restoreVersion } = useContext(noteContext);
	const [versions, setVersions] = useState([]);
	const [selected, setSelected] = useState(null);
	const [loading, setLoading] = useState(false);
	const [restoring, setRestoring] = useState(false);

	// refs for synced scrolling
	const leftRef = useRef(null);
	const rightRef = useRef(null);
	const isSyncingRef = useRef(false);

	useEffect(() => {
		let mounted = true;
		(async () => {
			setLoading(true);
			try {
				const v = await getVersions(noteId);
				if (mounted) setVersions(v);
			} catch (err) {
				console.error("Failed to load versions", err);
				if (showAlert) showAlert("Failed to load versions", "danger");
			} finally {
				setLoading(false);
			}
		})();
		return () => (mounted = false);
	}, [noteId, getVersions, showAlert]);

	// Sync vertical scroll between left and right panes
	useEffect(() => {
		const left = leftRef.current;
		const right = rightRef.current;
		if (!left || !right) return;

		const onLeftScroll = () => {
			if (isSyncingRef.current) return;
			isSyncingRef.current = true;
			right.scrollTop = left.scrollTop;
			// small timeout to avoid recursion
			setTimeout(() => (isSyncingRef.current = false), 50);
		};
		const onRightScroll = () => {
			if (isSyncingRef.current) return;
			isSyncingRef.current = true;
			left.scrollTop = right.scrollTop;
			setTimeout(() => (isSyncingRef.current = false), 50);
		};

		left.addEventListener("scroll", onLeftScroll);
		right.addEventListener("scroll", onRightScroll);

		return () => {
			left.removeEventListener("scroll", onLeftScroll);
			right.removeEventListener("scroll", onRightScroll);
		};
	}, [leftRef, rightRef, selected]);

	const handleRestore = async (versionId) => {
		if (!window.confirm("Restore this version? A backup of the current note will be saved.")) return;
		try {
			setRestoring(true);
			await restoreVersion(noteId, versionId);
			if (showAlert) showAlert("Restored version successfully", "success");
			onClose();
		} catch (err) {
			console.error("Restore failed", err);
			if (showAlert) showAlert("Restore failed", "danger");
		} finally {
			setRestoring(false);
		}
	};

	return (
		<div className="modal fade show d-block" tabIndex="-1" onClick={onClose} style={{ background: "rgba(0,0,0,0.6)" }}>
			<div className="modal-dialog modal-xl modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
				<div className="modal-content">
					<div className="modal-header">
						<h5 className="modal-title">Version history</h5>
						<button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
					</div>

					<div className="modal-body">
						{loading ? (
							<p>Loading versions…</p>
						) : versions.length === 0 ? (
							<p>No versions found for this note.</p>
						) : (
							<>
								<div style={{ marginBottom: 8 }}>
									<small className="text-muted">Compare the current note (left) with any saved version (right). Use the restore button on the right to make the selected version active.</small>
								</div>

								<div className="row g-3">
									<div className="col-md-4">
										<div style={{ maxHeight: "58vh", overflowY: "auto" }}>
											{versions.map((v) => (
												<div key={v._id} className={`p-2 mb-2 border rounded ${selected && selected._id === v._id ? "bg-light" : ""}`} style={{ cursor: "pointer" }} onClick={() => setSelected(v)}>
													<div style={{ fontWeight: 600 }}>{decodeHtmlSafe(v.title) || "(no title)"}</div>
													<div style={{ fontSize: 12, color: "#666" }}>{new Date(v.savedAt).toLocaleString()}</div>
													{v.comment && <div style={{ fontSize: 12 }}>{decodeHtmlSafe(v.comment)}</div>}
												</div>
											))}
										</div>
									</div>

									<div className="col-md-8">
										<div className="row">
											{/* Left: current note */}
											<div className="col-md-6">
												<div style={{ marginBottom: 8, fontWeight: 600 }}>Current</div>
												<div ref={leftRef} style={{ maxHeight: "56vh", overflowY: "auto", paddingRight: 10 }}>
													<NoteCardMini noteData={currentNote} />
												</div>
											</div>

											{/* Right: selected version */}
											<div className="col-md-6">
												<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
													<div style={{ fontWeight: 600 }}>Selected version</div>
													{selected && (
														<div>
															<button className="btn btn-sm btn-outline-secondary me-2" onClick={() => setSelected(null)}>
																Clear
															</button>
															<button className="btn btn-sm btn-primary" onClick={() => handleRestore(selected._id)} disabled={restoring}>
																{restoring ? "Restoring…" : "Restore"}
															</button>
														</div>
													)}
												</div>

												<div ref={rightRef} style={{ maxHeight: "56vh", overflowY: "auto", paddingLeft: 10 }}>
													{selected ? <NoteCardMini noteData={selected} /> : <div className="p-3 border rounded text-muted">Select a version from the left to preview it here.</div>}
												</div>
											</div>
										</div>

										
									</div>
								</div>
							</>
						)}
					</div>

					<div className="modal-footer">
						<small className="text-muted me-auto">Tip: you can restore any version — a backup of the current note is saved automatically.</small>
						<button type="button" className="btn btn-secondary" onClick={onClose}>
							Close
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

/**
 * Simple helper to decode HTML entity strings for safe display in titles/comments.
 */
function decodeHtmlSafe(str = "") {
	try {
		const txt = document.createElement("textarea");
		txt.innerHTML = str;
		return txt.value;
	} catch {
		return str;
	}
}

export default VersionHistoryModal;

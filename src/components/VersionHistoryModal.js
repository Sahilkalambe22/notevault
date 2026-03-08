// src/components/VersionHistoryModal.js

import React, { useEffect, useState, useContext } from "react";
import noteContext from "../context/notes/notesContext";
import NotePreview from "./NotePreview";
import VersionPreviewSkeleton from "./loaders/VersionPreviewSkeleton";

import "./VersionHistoryModal.css";

const VersionHistoryModal = ({ noteId, currentNote = {}, onClose, showAlert }) => {
	const { getVersions, restoreVersion } = useContext(noteContext);

	const [versions, setVersions] = useState([]);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [loading, setLoading] = useState(false);
	const [restoring, setRestoring] = useState(false); 

	/* CURRENT VERSION */
	const currentVersion = versions[currentIndex];

	/* LOAD VERSIONS */
	useEffect(() => {
		let mounted = true;

		(async () => {
			if (!noteId) return;

			setLoading(true);

			try {
				const v = await getVersions(noteId);

				if (mounted) {
					setVersions(v);
					setCurrentIndex(0); // newest version first
				}
			} catch (err) {
				console.error(err);
				showAlert?.("Failed to load versions", "danger");
			} finally {
				setLoading(false);
			}
		})();

		return () => (mounted = false);
	}, [noteId, getVersions, showAlert]);

	/* NAVIGATION */

	const goOlder = () => {
		if (currentIndex < versions.length - 1) {
			setCurrentIndex((prev) => prev + 1);
		}
	};

	const goNewer = () => {
		if (currentIndex > 0) {
			setCurrentIndex((prev) => prev - 1);
		}
	};

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
				{/* MAIN PANEL */}

				<main className="vh-diff-panel">
					<div className="vh-diff-header">
						{/* VERSION NAVIGATION */}

						<div className="vh-version-nav">
							<button onClick={goOlder} disabled={currentIndex >= versions.length - 1}>
								← Older
							</button>

							<span>
								Version {versions.length - currentIndex} of {versions.length}
							</span>

							<button onClick={goNewer} disabled={currentIndex === 0}>
								Newer →
							</button>
						</div>

						<div className="vh-header-actions">
							{currentVersion && (
								<button className="vh-restore" onClick={() => handleRestore(currentVersion._id)} disabled={restoring}>
									{restoring ? "Restoring…" : "Restore version"}
								</button>
							)}

							<button className="vh-close" onClick={onClose}>
								✕
							</button>
						</div>
					</div>

					{/* BODY */}

					<div className="vh-diff-body">
						{loading ? (
							<VersionPreviewSkeleton />
						) : versions.length === 0 ? (
							<div className="vh-muted">No versions found.</div>
						) : currentVersion ? (
							<>
								{/* FULL NOTE PREVIEW */}

								<div className="vh-note-preview">
									<NotePreview note={currentVersion} isPreviewMode />
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

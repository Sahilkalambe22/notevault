// src/components/AddNote.jsx

import React, { useContext, useRef, useState } from "react";
import noteContext from "../context/notes/notesContext";
import RichTextEditor from "./RichTextEditor";
import TagSelector from "./TagSelector";
import OcrExtractor from "./OcrExtractor";

const AddNote = (props) => {
	const context = useContext(noteContext);
	const { addNote } = context;

	const [note, setnote] = useState({
		title: "",
		description: "",
		etagType: "",
		etagCustom: "",
		reminderEnabled: false,
		reminderAt: "", // datetime-local value
	});

	const [imageFile, setImageFile] = useState(null);
	const [attachmentFiles, setAttachmentFiles] = useState([]);

	// used to force remount OCR component on reset
	const [ocrKey, setOcrKey] = useState(0);

	// refs for hidden file inputs
	const imageInputRef = useRef(null);
	const attachmentsInputRef = useRef(null);

	const tags = ["Work", "Random", "Important", "Todo", "Personal", "Priority"];
	const tagColorMap = {
		Work: "primary",
		Random: "secondary",
		Important: "danger",
		Todo: "success",
		Personal: "light",
		Priority: "warning",
	};

	const onChange = (e) => setnote({ ...note, [e.target.name]: e.target.value });

	// open hidden file inputs
	const openImagePicker = () => imageInputRef.current?.click();
	const openAttachmentsPicker = () => attachmentsInputRef.current?.click();

	const handleImageChange = (e) => {
		const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
		setImageFile(file);
	};

	const handleAttachmentsChange = (e) => {
		const files = Array.from(e.target.files || []);
		setAttachmentFiles(files.slice(0, 3));
	};

	const clearFiles = () => {
		setImageFile(null);
		setAttachmentFiles([]);
		if (imageInputRef.current) imageInputRef.current.value = "";
		if (attachmentsInputRef.current) attachmentsInputRef.current.value = "";
	};

	const handleClick = async (e) => {
		e.preventDefault();

		// strip HTML tags from description for length check
		const plainDescription = (note.description || "").replace(/<[^>]+>/g, "").trim();

		if (note.title.trim().length < 5 || plainDescription.length < 10) {
			props.showAlert("Title must be ≥ 5 chars and Description must be ≥ 10 chars", "warning");
			return;
		}

		const computedCustom = (note.etagCustom || "").trim();
		const finalTag = computedCustom || note.etagType || "Random";

		// 🔔 Build reminder value to send (ISO string or null)
		const reminderToSend = note.reminderEnabled && note.reminderAt ? new Date(note.reminderAt).toISOString() : null;

		const created = await addNote(note.title, note.description, finalTag, imageFile, attachmentFiles, note.etagType, reminderToSend);
		console.log("AddNote: addNote returned:", created);

		setnote({
			title: "",
			description: "",
			etagType: "",
			etagCustom: "",
			reminderEnabled: false,
			reminderAt: "",
		});
		clearFiles();

		// reset OCR component
		setOcrKey((k) => k + 1);

		props.showAlert("Note Added", "success");
	};

	return (
		<div className="d-flex justify-content-center my-5">
			<div className="card shadow-lg addnote-pro-card">
				<div className="card-body">
					<h4 className="card-title mb-3">Add A Note</h4>

					{/* Tag selector (reusable component) */}
					<TagSelector
						tags={tags}
						tagColorMap={tagColorMap}
						typeValue={note.etagType}
						customValue={note.etagCustom}
						onTypeChange={(val) =>
							setnote((prev) => ({
								...prev,
								etagType: val,
							}))
						}
						onCustomChange={(val) =>
							setnote((prev) => ({
								...prev,
								etagCustom: val,
							}))
						}
					/>

					{/* Title */}
					<div className="mb-3">
						<input className="form-control form-control-lg" placeholder="Title" name="title" id="title" value={note.title} onChange={onChange} minLength={5} required />
					</div>

					{/* Description - reusable rich text editor */}
					<RichTextEditor
						value={note.description}
						onChange={(html) =>
							setnote((prev) => ({
								...prev,
								description: html,
							}))
						}
					/>

					{/* OCR section as separate component */}
					<OcrExtractor
						key={ocrKey}
						showAlert={props.showAlert}
						onApplyDescription={(html) =>
							setnote((prev) => ({
								...prev,
								description: html,
							}))
						}
						onUseImage={(file) => {
							setImageFile(file);
						}}
					/>

					{/* 🔔 Reminder section */}
					<div className="mb-3">
						<div className="form-check form-switch">
							<input
								className="form-check-input"
								type="checkbox"
								id="reminderEnabled"
								checked={note.reminderEnabled}
								onChange={(e) =>
									setnote((prev) => ({
										...prev,
										reminderEnabled: e.target.checked,
										reminderAt: e.target.checked ? prev.reminderAt : "",
									}))
								}
							/>
							<label className="form-check-label" htmlFor="reminderEnabled">
								Add reminder
							</label>
						</div>

						{note.reminderEnabled && (
							<div className="mt-2">
								<label className="form-label small text-muted">Reminder date &amp; time</label>
								<input
									type="datetime-local"
									className="form-control"
									value={note.reminderAt}
									onChange={(e) =>
										setnote((prev) => ({
											...prev,
											reminderAt: e.target.value,
										}))
									}
								/>
								<div className="form-text">The reminder will trigger around this time while the app is open.</div>
							</div>
						)}
					</div>

					{/* Hidden native inputs */}
					<input ref={imageInputRef} type="file" accept="image/*" className="d-none" onChange={handleImageChange} />
					<input ref={attachmentsInputRef} type="file" multiple className="d-none" onChange={handleAttachmentsChange} />

					{/* File pickers as buttons */}
					<div className="row gx-3 align-items-center mb-3">
						<div className="col-auto">
							<button type="button" className="btn btn-outline-primary btn-sm" onClick={openImagePicker}>
								<i className="fa-regular fa-image me-2" /> Choose Image
							</button>
						</div>
						<div className="col">
							<div className="text-muted small">
								{imageFile ? (
									<span>
										<strong>Image:</strong> {imageFile.name}{" "}
										<button
											type="button"
											className="btn btn-link btn-sm p-0 ms-2"
											onClick={() => {
												setImageFile(null);
												if (imageInputRef.current) imageInputRef.current.value = "";
											}}
										>
											Remove
										</button>
									</span>
								) : (
									<span>No image selected</span>
								)}
							</div>
						</div>
					</div>

					<div className="row gx-3 align-items-center mb-3">
						<div className="col-auto">
							<button type="button" className="btn btn-outline-secondary btn-sm" onClick={openAttachmentsPicker}>
								<i className="fa-solid fa-paperclip me-2" /> Attach Files
							</button>
						</div>
						<div className="col">
							<div className="text-muted small">
								{attachmentFiles.length > 0 ? (
									<span>
										<strong>Attachments:</strong> {attachmentFiles.map((f) => f.name).join(", ")}{" "}
										<button
											type="button"
											className="btn btn-link btn-sm p-0 ms-2"
											onClick={() => {
												setAttachmentFiles([]);
												if (attachmentsInputRef.current) attachmentsInputRef.current.value = "";
											}}
										>
											Remove
										</button>
									</span>
								) : (
									<span>No attachments selected (max 3)</span>
								)}
							</div>
						</div>
					</div>

					{/* Action */}
					<div className="d-flex justify-content-start gap-2">
						<button className="btn btn-dark btn-lg" onClick={handleClick}>
							<i className="fa-regular fa-pen-to-square me-2" /> Add Note
						</button>
						<button
							type="button"
							className="btn btn-outline-secondary btn-lg"
							onClick={() => {
								setnote({
									title: "",
									description: "",
									etagType: "",
									etagCustom: "",
									reminderEnabled: false,
									reminderAt: "",
								});
								clearFiles();
								setOcrKey((k) => k + 1); // reset OCR section
							}}
						>
							Reset
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AddNote;

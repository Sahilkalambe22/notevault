// src/components/EditNoteModal.jsx

import React from "react";
import RichTextEditor from "./RichTextEditor";
import TagSelector from "./TagSelector";

const EditNoteModal = ({ note, setnote, tags, tagColorMap, onSubmit, openRef, closeRef }) => {
	return (
		<>
			{/* hidden trigger button (used by updateNote in Notes.jsx) */}
			<button ref={openRef} type="button" className="btn btn-primary d-none" data-bs-toggle="modal" data-bs-target="#editNoteModal">
				Launch edit modal
			</button>

			<div className="modal fade" id="editNoteModal" tabIndex="-1" aria-labelledby="editNoteModalLabel" aria-hidden="true">
				{/* 🔥 Full-screen dialog (feels like a separate page) */}
				<div className="modal-dialog modal-dialog-centered modal-fullscreen">
					<div
						className="modal-content"
						style={{ borderRadius: 0, backgroundColor: "#fffdf2" }} // light note-paper feel
					>
						{/* Top bar like mobile app */}
						<div className="modal-header border-0 pb-2">
							<button type="button" className="btn btn-link text-decoration-none" data-bs-dismiss="modal" ref={closeRef}>
								<i className="fa-solid fa-arrow-left me-1"></i> Back
							</button>

							<h1 className="modal-title fs-5 mx-auto" id="editNoteModalLabel">
								Edit Note
							</h1>

							<button type="button" className="btn btn-primary" onClick={onSubmit}>
								Save
							</button>
						</div>

						{/* Scrollable content area */}
						<div className="modal-body pt-0" style={{ overflowY: "auto" }}>
							<form>
								{/* Title */}
								<div className="mb-3">
									<label htmlFor="etitle" className="form-label">
										Title
									</label>
									<input
										type="text"
										className="form-control"
										id="etitle"
										name="etitle"
										value={note.etitle}
										onChange={(e) =>
											setnote((prev) => ({
												...prev,
												etitle: e.target.value,
											}))
										}
									/>
								</div>

								{/* Description (rich text) */}
								<RichTextEditor
									value={note.edescription}
									onChange={(html) =>
										setnote((prev) => ({
											...prev,
											edescription: html,
										}))
									}
									label="Description (rich text)"
								/>

								{/* Tag selector */}
								<div className="mt-3">
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
										label="Tag Type (choose) & Custom Name (optional)"
									/>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default EditNoteModal;

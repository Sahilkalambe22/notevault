// src/components/EditNoteModal.jsx

import React from "react";
import RichTextEditor from "./RichTextEditor";
import TagSelector from "./TagSelector";

const EditNoteModal = ({ note, setnote, tags, tagColorMap, onSubmit, openRef, closeRef }) => {
	return (
		<>
			{/* hidden trigger button (used by updateNote in Notes.jsx) */}
			<button ref={openRef} type="button" className="btn btn-primary d-none" data-bs-toggle="modal" data-bs-target="#exampleModal">
				Launch edit modal
			</button>

			<div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
				<div className="modal-dialog">
					<div className="modal-content">
						<div className="modal-header">
							<h1 className="modal-title fs-5" id="exampleModalLabel">
								Edit Note
							</h1>
							<button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
						</div>

						<div className="modal-body">
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
							</form>
						</div>

						<div className="modal-footer">
							<button ref={closeRef} type="button" className="btn btn-secondary" data-bs-dismiss="modal">
								Close
							</button>
							<button type="button" className="btn btn-primary" onClick={onSubmit}>
								Update Note
							</button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default EditNoteModal;

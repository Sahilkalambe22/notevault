// src/components/OcrExtractor.jsx

import React, { useRef, useState } from "react";

const OcrExtractor = ({ showAlert, onApplyDescription, onUseImage }) => {
	// switch to enable / disable OCR section
	const [enabled, setEnabled] = useState(false);

	// OCR-specific states
	const [ocrLoading, setOcrLoading] = useState(false);
	const [ocrText, setOcrText] = useState("");
	const [ocrSelectedFile, setOcrSelectedFile] = useState(null); // file chosen for OCR
	const [useOcrFileAsNoteImage, setUseOcrFileAsNoteImage] = useState(false);

	const ocrInputRef = useRef(null);

	// Upload selected file to /api/notes/ocr and get extracted text
	const handleOCRUpload = async (file) => {
		if (!file) return;

		setOcrLoading(true);
		setOcrText("");
		setOcrSelectedFile(file);
		setUseOcrFileAsNoteImage(false);

		try {
			const formData = new FormData();
			formData.append("image", file);

			const resp = await fetch("http://localhost:5000/api/notes/ocr", {
				method: "POST",
				headers: {
					"auth-token": localStorage.getItem("token") || "",
				},
				body: formData,
			});

			if (!resp.ok) {
				const body = await resp.json().catch(() => ({}));
				showAlert(body.error || "OCR failed", "danger");
				setOcrLoading(false);
				return;
			}

			const json = await resp.json();
			setOcrText(json.text || "");
			showAlert("Text extracted. Edit if needed, then insert into description.", "success");
		} catch (err) {
			console.error("OCR upload failed:", err);
			showAlert("OCR failed. Try again.", "danger");
		} finally {
			setOcrLoading(false);
		}
	};

	// When user chooses file via input for OCR
	const onOcrInputChange = (e) => {
		const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
		if (!file) return;
		handleOCRUpload(file);
	};

	// If user wants to use same file as the note image, inform parent
	const applyOcrFileAsNoteImage = () => {
		if (!ocrSelectedFile) {
			showAlert("No OCR image to use", "warning");
			return;
		}
		if (typeof onUseImage === "function") {
			onUseImage(ocrSelectedFile);
		}
		setUseOcrFileAsNoteImage(true);
		showAlert("OCR image selected as note image (will be uploaded when you save)", "info");
	};

	// Insert extracted text into note description (parent)
	const insertTextIntoDescription = () => {
		if (!ocrText.trim()) {
			showAlert("No text to insert", "warning");
			return;
		}
		const html = `<pre style="white-space:pre-wrap">${ocrText}</pre>`;
		if (typeof onApplyDescription === "function") {
			onApplyDescription(html);
		}
		showAlert("OCR text inserted into description", "success");
	};

	// Clear everything (used when switch off / clear button)
	const clearOcrState = () => {
		if (ocrInputRef.current) ocrInputRef.current.value = "";
		setOcrSelectedFile(null);
		setOcrText("");
		setUseOcrFileAsNoteImage(false);
	};

	return (
		<div className="mb-3 mt-3">
			{/* Switch to enable OCR */}
			<div className="form-check form-switch mb-2">
				<input
					className="form-check-input"
					type="checkbox"
					id="ocrEnabled"
					checked={enabled}
					onChange={(e) => {
						const checked = e.target.checked;
						setEnabled(checked);
						if (!checked) {
							clearOcrState();
						}
					}}
				/>
				<label className="form-check-label" htmlFor="ocrEnabled">
					Extract text from image (OCR)
				</label>
			</div>

			{/* OCR section only when enabled */}
			{enabled && (
				<div className="p-2 border rounded">
					<label className="form-label fw-bold">Extract text from image (OCR)</label>

					<div className="d-flex gap-2 align-items-center mb-2">
						<input ref={ocrInputRef} type="file" accept="image/*" className="form-control form-control-sm" style={{ maxWidth: 380 }} onChange={onOcrInputChange} />

						<button type="button" className="btn btn-outline-secondary btn-sm" onClick={clearOcrState}>
							Clear
						</button>

						<div className="ms-auto">
							{ocrLoading && <span className="text-muted small">Extracting…</span>}
							{!ocrLoading && ocrSelectedFile && <span className="text-muted small">File ready: {ocrSelectedFile.name}</span>}
						</div>
					</div>

					{ocrText && (
						<>
							<label className="form-label small">Extracted text (editable)</label>
							<textarea className="form-control mb-2" rows={4} value={ocrText} onChange={(e) => setOcrText(e.target.value)} />

							<div className="d-flex gap-2">
								<button type="button" className="btn btn-outline-secondary btn-sm" onClick={insertTextIntoDescription}>
									Use extracted text as description
								</button>

								<button type="button" className={`btn btn-outline-success btn-sm ${useOcrFileAsNoteImage ? "active" : ""}`} onClick={applyOcrFileAsNoteImage} disabled={!ocrSelectedFile}>
									Use image as note image
								</button>

								<div className="ms-auto text-muted small align-self-center">{/* placeholder */}</div>
							</div>
						</>
					)}
				</div>
			)}
		</div>
	);
};

export default OcrExtractor;

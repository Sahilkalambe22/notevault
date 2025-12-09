// src/components/RichTextEditor.jsx
import React, { useEffect, useRef, useState } from "react";

const defaultFormat = {
	bold: false,
	italic: false,
	underline: false,
	ul: false,
	ol: false,
	h3: false,
};

const RichTextEditor = ({ value, onChange, minHeight = 120, label = "Description (rich text)", showLabel = true }) => {
	const editorRef = useRef(null);
	const [format, setFormat] = useState(defaultFormat);

	// Sync external "value" → DOM (BUT avoid caret jumps)
	useEffect(() => {
		const el = editorRef.current;
		if (!el) return;

		const current = el.innerHTML;
		const incoming = value || "";

		if (current !== incoming) {
			el.innerHTML = incoming;
		}
	}, [value]);

	// Update toolbar highlight based on caret
	const updateToolbar = () => {
		try {
			setFormat({
				bold: document.queryCommandState("bold"),
				italic: document.queryCommandState("italic"),
				underline: document.queryCommandState("underline"),
				ul: document.queryCommandState("insertUnorderedList"),
				ol: document.queryCommandState("insertOrderedList"),
				h3: (document.queryCommandValue("formatBlock") || "").toLowerCase().includes("h3"),
			});
		} catch {}
	};

	// Handle typing, pasting, formatting
	const handleInput = () => {
		const html = editorRef.current?.innerHTML || "";
		onChange && onChange(html);
		updateToolbar();
	};

	// Execute formatting commands
	const exec = (cmd, val = null) => {
		document.execCommand(cmd, false, val);
		handleInput(); // update after formatting
	};

	// Clear all formatting
	const clearAll = () => {
		if (editorRef.current) editorRef.current.innerHTML = "";
		onChange("");
		setFormat(defaultFormat);
	};

	return (
		<div className="mb-3">
			{showLabel && <label className="form-label small text-muted">{label}</label>}

			{/* Toolbar */}
			<div className="btn-group btn-group-sm mb-2">
				<button type="button" className={`btn btn-outline-secondary ${format.bold ? "active" : ""}`} onClick={() => exec("bold")}>
					<b>B</b>
				</button>

				<button type="button" className={`btn btn-outline-secondary ${format.italic ? "active" : ""}`} onClick={() => exec("italic")}>
					<i>I</i>
				</button>

				<button type="button" className={`btn btn-outline-secondary ${format.underline ? "active" : ""}`} onClick={() => exec("underline")}>
					<u>U</u>
				</button>

				<button type="button" className={`btn btn-outline-secondary ${format.ul ? "active" : ""}`} onClick={() => exec("insertUnorderedList")}>
					• List
				</button>

				<button type="button" className={`btn btn-outline-secondary ${format.ol ? "active" : ""}`} onClick={() => exec("insertOrderedList")}>
					1. List
				</button>

				<button type="button" className={`btn btn-outline-secondary ${format.h3 ? "active" : ""}`} onClick={() => exec("formatBlock", "h3")}>
					H3
				</button>

				<button type="button" className="btn btn-outline-secondary" onClick={clearAll}>
					Clear
				</button>
			</div>

			{/* ContentEditable Editor */}
			<div ref={editorRef} className="form-control" contentEditable style={{ minHeight }} onInput={handleInput} onKeyUp={updateToolbar} onMouseUp={updateToolbar} onClick={updateToolbar} />

			<div className="form-text">You can use bold, italic, underline, lists, and headings. Description must contain at least 10 plain-text characters.</div>
		</div>
	);
};

export default RichTextEditor;

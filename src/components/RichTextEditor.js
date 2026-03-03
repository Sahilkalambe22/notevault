import React, { useEffect, useRef, useState } from "react";
import "./RichTextEditor.css";

const defaultFormat = {
	bold: false,
	italic: false,
	underline: false,
	strike: false,
	ul: false,
	ol: false,
	h3: false,
	highlight: false,
};

const RichTextEditor = ({ value, onChange, minHeight = 420 }) => {
	const editorRef = useRef(null);
	const savedRange = useRef(null);
	const [format, setFormat] = useState(defaultFormat);
	const isInternalChange = useRef(false);

	/* ===============================
     SYNC EXTERNAL VALUE
  =============================== */
	useEffect(() => {
		const el = editorRef.current;
		if (!el) return;

		if (isInternalChange.current) {
			isInternalChange.current = false;
			return;
		}

		if (el.innerHTML !== (value || "")) {
			el.innerHTML = value || "";

			const images = el.querySelectorAll("img");
			images.forEach((img) => {
				img.removeAttribute("style");
			});
		}
	}, [value]);

	/* ===============================
     SAVE CURSOR POSITION
  =============================== */
	const saveSelection = () => {
		const selection = window.getSelection();
		if (selection.rangeCount > 0) {
			savedRange.current = selection.getRangeAt(0);
		}
	};

	/* ===============================
     UPDATE TOOLBAR STATE
  =============================== */
	const updateToolbar = () => {
		try {
			setFormat({
				bold: document.queryCommandState("bold"),
				italic: document.queryCommandState("italic"),
				underline: document.queryCommandState("underline"),
				strike: document.queryCommandState("strikeThrough"),
				ul: document.queryCommandState("insertUnorderedList"),
				ol: document.queryCommandState("insertOrderedList"),
				h3: document.queryCommandValue("formatBlock")?.toLowerCase().includes("h3"),
				highlight: document.queryCommandValue("backColor") === "yellow",
			});
		} catch {}
	};

	/* ===============================
     HANDLE INPUT
  =============================== */
	const handleInput = () => {
		isInternalChange.current = true;
		onChange(editorRef.current.innerHTML);
		updateToolbar();
	};

	/* ===============================
     EXEC FORMAT COMMAND
  =============================== */
	const exec = (cmd, val = null) => {
		editorRef.current.focus();
		document.execCommand(cmd, false, val);
		handleInput();
	};

	/* ===============================
     EXTRA FORMATTING
  =============================== */

	const toggleHighlight = () => {
		editorRef.current.focus();
		const isActive = document.queryCommandValue("backColor") === "yellow";

		document.execCommand("backColor", false, isActive ? "transparent" : "yellow");

		handleInput();
	};

	const insertInlineCode = () => {
		editorRef.current.focus();
		const selection = window.getSelection();
		const selectedText = selection.toString();

		if (!selectedText) return;

		document.execCommand("insertHTML", false, `<code class="ne-inline-code">${selectedText}</code>`);

		handleInput();
	};

	const insertQuote = () => {
		editorRef.current.focus();
		document.execCommand("formatBlock", false, "blockquote");
		handleInput();
	};

	const insertDivider = () => {
		editorRef.current.focus();
		document.execCommand("insertHorizontalRule");
		handleInput();
	};

	/* ===============================
     INSERT IMAGE
  =============================== */
	const insertImageAtCursor = (url) => {
		const img = document.createElement("img");
		img.src = url;
		img.style.maxWidth = "60%";
		img.style.height = "auto";
		img.style.display = "block";
		img.style.margin = "24px auto";
		img.style.borderRadius = "12px";

		const selection = window.getSelection();

		if (savedRange.current) {
			selection.removeAllRanges();
			selection.addRange(savedRange.current);
		}

		if (!selection.rangeCount) return;

		const range = selection.getRangeAt(0);
		range.deleteContents();
		range.insertNode(img);

		range.setStartAfter(img);
		range.setEndAfter(img);
		selection.removeAllRanges();
		selection.addRange(range);

		handleInput();
	};

	const handleImageClick = () => {
		const noteId = window.location.pathname.split("/").pop();

		if (noteId === "new") {
			alert("Please type something first so the note gets created.");
			return;
		}

		const input = document.createElement("input");
		input.type = "file";
		input.accept = "image/*";
		input.click();

		input.onchange = async () => {
			const file = input.files[0];
			if (!file) return;

			try {
				const formData = new FormData();
				formData.append("image", file);

				const res = await fetch(`http://localhost:5000/api/notes/${noteId}/upload-inline-image`, {
					method: "POST",
					headers: {
						"auth-token": localStorage.getItem("token"),
					},
					body: formData,
				});

				if (!res.ok) return;

				const data = await res.json();
				insertImageAtCursor(data.imageUrl);
			} catch (err) {
				console.error("Image upload failed:", err);
			}
		};
	};

	/* ===============================
     RENDER
  =============================== */
	return (
		<div>
			<div className="ne-toolbar">
				{/* Bold */}
				<button type="button" className={`btn btn-outline-secondary ${format.bold ? "active" : ""}`} onClick={() => exec("bold")} data-bs-toggle="tooltip" data-bs-placement="top" title="Bold (Ctrl + B)">
					<i className="fa-solid fa-bold"></i>
				</button>

				{/* Italic */}
				<button type="button" className={`btn btn-outline-secondary ${format.italic ? "active" : ""}`} onClick={() => exec("italic")} data-bs-toggle="tooltip" title="Italic (Ctrl + I)">
					<i className="fa-solid fa-italic"></i>
				</button>

				{/* Underline */}
				<button type="button" className={`btn btn-outline-secondary ${format.underline ? "active" : ""}`} onClick={() => exec("underline")} data-bs-toggle="tooltip" title="Underline (Ctrl + U)">
					<i className="fa-solid fa-underline"></i>
				</button>

				{/* Strikethrough */}
				<button type="button" className={`btn btn-outline-secondary ${format.strike ? "active" : ""}`} onClick={() => exec("strikeThrough")} data-bs-toggle="tooltip" title="Strikethrough">
					<i className="fa-solid fa-strikethrough"></i>
				</button>

				{/* Highlight */}
				<button type="button" className={`btn btn-outline-secondary ${format.highlight ? "active" : ""}`} onClick={toggleHighlight} data-bs-toggle="tooltip" title="Highlight">
					<i className="fa-solid fa-highlighter"></i>
				</button>

				{/* Bullet List */}
				<button type="button" className={`btn btn-outline-secondary ${format.ul ? "active" : ""}`} onClick={() => exec("insertUnorderedList")} data-bs-toggle="tooltip" title="Bullet List">
					<i className="fa-solid fa-list-ul"></i>
				</button>

				{/* Numbered List */}
				<button type="button" className={`btn btn-outline-secondary ${format.ol ? "active" : ""}`} onClick={() => exec("insertOrderedList")} data-bs-toggle="tooltip" title="Numbered List">
					<i className="fa-solid fa-list-ol"></i>
				</button>

				{/* H3 */}
				<button type="button" className={`btn btn-outline-secondary ${format.h3 ? "active" : ""}`} onClick={() => exec("formatBlock", "h3")} data-bs-toggle="tooltip" title="Heading 3">
					<i className="fa-solid fa-heading"></i>
				</button>

				{/* Quote */}
				<button type="button" className="btn btn-outline-secondary" onClick={insertQuote} data-bs-toggle="tooltip" title="Quote">
					<i className="fa-solid fa-quote-left"></i>
				</button>

				{/* Divider */}
				<button type="button" className="btn btn-outline-secondary" onClick={insertDivider} data-bs-toggle="tooltip" title="Divider">
					<i className="fa-solid fa-minus"></i>
				</button>

				{/* Inline Code */}
				<button type="button" className="btn btn-outline-secondary" onClick={insertInlineCode} data-bs-toggle="tooltip" title="Inline Code">
					<i className="fa-solid fa-code"></i>
				</button>

				{/* Image */}
				<button type="button" className="btn btn-outline-secondary" onClick={handleImageClick} data-bs-toggle="tooltip" title="Insert Image">
					<i className="fa-solid fa-image"></i>
				</button>
			</div>

			<div
				ref={editorRef}
				className="form-control"
				contentEditable
				style={{ minHeight }}
				onInput={handleInput}
				onClick={() => {
					saveSelection();
					updateToolbar();
				}}
				onKeyUp={() => {
					saveSelection();
					updateToolbar();
				}}
			/>
		</div>
	);
};

export default RichTextEditor;

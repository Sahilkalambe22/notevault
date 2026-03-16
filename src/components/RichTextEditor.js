import React, { useEffect, useRef, useState } from "react";
import "./RichTextEditor.css";

const host = "http://localhost:5000";
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
	KEYBOARD SHORTCUTS
	================================ */

	const handleKeyDown = (e) => {
		if (e.key === "Enter") {
			saveSelection();
		}
		if (!e.ctrlKey) return;

		switch (e.key.toLowerCase()) {
			case "b":
				e.preventDefault();
				exec("bold");
				break;

			case "i":
				e.preventDefault();
				exec("italic");
				break;

			case "u":
				e.preventDefault();
				exec("underline");
				break;

			case "`":
				e.preventDefault();
				insertInlineCode();
				break;

			case "h":
				if (e.shiftKey) {
					e.preventDefault();
					toggleHighlight();
				}
				break;

			default:
				break;
		}
	};

	/* ===============================
		HANDLE INPUT
	=============================== */
	const handleInput = () => {
		saveSelection(); // preserve caret position

		isInternalChange.current = true;
		onChange(editorRef.current.innerHTML);

		setTimeout(() => {
			if (savedRange.current) {
				const selection = window.getSelection();
				selection.removeAllRanges();
				selection.addRange(savedRange.current);
			}
		}, 0);

		updateToolbar();
	};

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
				if (img.closest(".ne-image-wrapper")) return;

				const wrapper = document.createElement("div");
				wrapper.className = "ne-image-wrapper";

				const controls = document.createElement("div");
				controls.className = "ne-image-controls";

				const removeBtn = document.createElement("button");
				removeBtn.className = "ne-image-remove";
				removeBtn.innerHTML = "✕";

				removeBtn.onclick = (e) => {
					e.stopPropagation();
					wrapper.remove();
					handleInput();
				};

				controls.appendChild(removeBtn);

				img.parentNode.insertBefore(wrapper, img);
				wrapper.appendChild(img);
				wrapper.appendChild(controls);
			});
		}
		// eslint-disable-next-line
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
			const selection = window.getSelection();
			const node = selection?.anchorNode?.parentElement;

			// detect highlight even if cursor is inside nested tags
			const highlightNode = node?.closest(".ne-highlight");

			setFormat({
				bold: document.queryCommandState("bold"),
				italic: document.queryCommandState("italic"),
				underline: document.queryCommandState("underline"),
				strike: document.queryCommandState("strikeThrough"),
				ul: document.queryCommandState("insertUnorderedList"),
				ol: document.queryCommandState("insertOrderedList"),
				h3: document.queryCommandValue("formatBlock")?.toLowerCase() === "h3",
				highlight: !!highlightNode,
			});
		} catch {}
	};

	/* ===============================
		EXEC FORMAT COMMAND
	=============================== */
	const exec = (cmd, val = null) => {
		const editor = editorRef.current;
		editor.focus();

		const selection = window.getSelection();

		// Restore saved selection ONLY if none exists
		if ((!selection || selection.rangeCount === 0) && savedRange.current) {
			selection.removeAllRanges();
			selection.addRange(savedRange.current);
		}

		document.execCommand(cmd, false, val);

		// save new selection after formatting
		saveSelection();

		handleInput();
	};
	// h3 formatting function with toggle behavior
	const toggleHeading = () => {
		const editor = editorRef.current;
		editor.focus();

		const currentBlock = document.queryCommandValue("formatBlock")?.toLowerCase();

		if (currentBlock === "h3") {
			document.execCommand("formatBlock", false, "p");
		} else {
			document.execCommand("formatBlock", false, "h3");
		}

		saveSelection();
		handleInput();
	};

	/* ===============================
		EXTRA FORMATTING
	=============================== */

	const toggleHighlight = () => {
		const editor = editorRef.current;
		editor.focus();

		const selection = window.getSelection();
		if (!selection.rangeCount) return;

		const range = selection.getRangeAt(0);
		const node = selection.anchorNode?.parentElement;

		// remove highlight if already highlighted
		if (node && node.classList?.contains("ne-highlight")) {
			const text = node.textContent;
			const textNode = document.createTextNode(text);

			node.replaceWith(textNode);

			range.setStartAfter(textNode);
			range.setEndAfter(textNode);

			selection.removeAllRanges();
			selection.addRange(range);

			handleInput();
			return;
		}

		const selectedText = range.toString();
		if (!selectedText) return;

		const span = document.createElement("span");
		span.className = "ne-highlight";
		span.textContent = selectedText;

		range.deleteContents();
		range.insertNode(span);

		// create space after highlight so cursor exits span
		const space = document.createTextNode(" ");
		span.after(space);

		range.setStartAfter(space);
		range.setEndAfter(space);

		selection.removeAllRanges();
		selection.addRange(range);

		handleInput();
	};

	const insertInlineCode = () => {
		editorRef.current.focus();

		const selection = window.getSelection();
		if (!selection.rangeCount) return;

		const range = selection.getRangeAt(0);
		const node = selection.anchorNode?.parentElement;

		// If already inside code → remove it
		if (node && node.tagName === "CODE") {
			const text = node.textContent;
			const textNode = document.createTextNode(text);

			node.replaceWith(textNode);

			range.setStartAfter(textNode);
			range.setEndAfter(textNode);

			selection.removeAllRanges();
			selection.addRange(range);

			handleInput();
			return;
		}

		const selectedText = range.toString();
		if (!selectedText) return;

		const code = document.createElement("code");
		code.className = "ne-inline-code";
		code.textContent = selectedText;

		range.deleteContents();
		range.insertNode(code);

		range.setStartAfter(code);
		range.setEndAfter(code);

		selection.removeAllRanges();
		selection.addRange(range);

		handleInput();
	};

	const toggleQuote = () => {
		const editor = editorRef.current;
		editor.focus();

		const currentBlock = document.queryCommandValue("formatBlock")?.toLowerCase();

		if (currentBlock === "blockquote") {
			document.execCommand("formatBlock", false, "p");
		} else {
			document.execCommand("formatBlock", false, "blockquote");
		}

		saveSelection();
		handleInput();
	};

	const insertDivider = () => {
		const editor = editorRef.current;
		editor.focus();

		const selection = window.getSelection();
		if (!selection.rangeCount) return;

		const range = selection.getRangeAt(0);

		const hr = document.createElement("hr");
		hr.className = "ne-divider";

		hr.contentEditable = "false";

		hr.onclick = () => {
			hr.remove();
			handleInput();
		};

		const br = document.createElement("br"); // next editable line

		range.deleteContents();
		range.insertNode(hr);

		// insert new line after hr
		hr.after(br);

		// move cursor to the new line
		range.setStartAfter(br);
		range.setEndAfter(br);

		selection.removeAllRanges();
		selection.addRange(range);

		saveSelection();
		handleInput();
	};

	/* ===============================
		INSERT IMAGE
	=============================== */
	const insertImageAtCursor = (url) => {
		const wrapper = document.createElement("div");
		wrapper.className = "ne-image-wrapper";
		wrapper.contentEditable = "false";

		const img = document.createElement("img");
		img.src = url;
		img.className = "ne-inline-image";

		img.onclick = () => {
			window.open(img.src, "_blank");
		};

		const controls = document.createElement("div");
		controls.className = "ne-image-controls";

		const removeBtn = document.createElement("button");
		removeBtn.className = "ne-image-remove";
		removeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';

		removeBtn.onclick = (e) => {
			e.stopPropagation();
			wrapper.remove();
			handleInput();
		};

		controls.appendChild(removeBtn);

		wrapper.appendChild(img);
		wrapper.appendChild(controls);

		const selection = window.getSelection();

		if (savedRange.current) {
			selection.removeAllRanges();
			selection.addRange(savedRange.current);
		}

		if (!selection.rangeCount) return;

		const range = selection.getRangeAt(0);

		range.deleteContents();

		range.insertNode(wrapper);

		// insert image
		range.insertNode(wrapper);

		// create editable line after image
		const br = document.createElement("br");
		wrapper.after(br);

		// move cursor AFTER the line break
		range.setStartAfter(br);
		range.setEndAfter(br);

		selection.removeAllRanges();
		selection.addRange(range);

		handleInput();

		return img;
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
				// show preview immediately
				const previewUrl = URL.createObjectURL(file);
				const insertedImg = insertImageAtCursor(previewUrl);

				// upload in background
				const formData = new FormData();
				formData.append("image", file);

				const res = await fetch(`${host}/api/notes/${noteId}/upload-inline-image`, {
					method: "POST",
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
					body: formData,
				});

				if (res.ok) {
					const data = await res.json();

					// replace preview image with real URL

					if (insertedImg && insertedImg.src.startsWith("blob:")) {
						insertedImg.src = data.imageUrl;
						URL.revokeObjectURL(previewUrl);
						handleInput();
						updateToolbar();
					}
				}
			} catch (err) {
				console.error("Image upload failed:", err);
			}
		};
	};

	const handlePaste = (e) => {
		e.preventDefault();
		const text = e.clipboardData.getData("text/plain");
		document.execCommand("insertText", false, text);
	};

	/* ===============================
		RENDER
	=============================== */
	return (
		<div>
			<div className="ne-toolbar" onMouseDown={(e) => e.preventDefault()}>
				{/* Bold */}
				<button type="button" className={`ne-toolbar-btn ${format.bold ? "active" : ""}`} onClick={() => exec("bold")} data-bs-toggle="tooltip" data-bs-placement="top" title="Bold (Ctrl + B)">
					<i className="fa-solid fa-bold"></i>
				</button>

				{/* Italic */}
				<button type="button" className={`ne-toolbar-btn ${format.italic ? "active" : ""}`} onClick={() => exec("italic")} data-bs-toggle="tooltip" title="Italic (Ctrl + I)">
					<i className="fa-solid fa-italic"></i>
				</button>

				{/* Underline */}
				<button type="button" className={`ne-toolbar-btn ${format.underline ? "active" : ""}`} onClick={() => exec("underline")} data-bs-toggle="tooltip" title="Underline (Ctrl + U)">
					<i className="fa-solid fa-underline"></i>
				</button>

				{/* Strikethrough */}
				<button type="button" className={`ne-toolbar-btn ${format.strike ? "active" : ""}`} onClick={() => exec("strikeThrough")} data-bs-toggle="tooltip" title="Strikethrough">
					<i className="fa-solid fa-strikethrough"></i>
				</button>

				{/* Highlight */}
				<button type="button" className={`ne-toolbar-btn ${format.highlight ? "active" : ""}`} onClick={toggleHighlight} data-bs-toggle="tooltip" title="Highlight">
					<i className="fa-solid fa-highlighter"></i>
				</button>

				{/* Bullet List */}
				<button type="button" className={`ne-toolbar-btn ${format.ul ? "active" : ""}`} onClick={() => exec("insertUnorderedList")} data-bs-toggle="tooltip" title="Bullet List">
					<i className="fa-solid fa-list-ul"></i>
				</button>

				{/* Numbered List */}
				<button type="button" className={`ne-toolbar-btn ${format.ol ? "active" : ""}`} onClick={() => exec("insertOrderedList")} data-bs-toggle="tooltip" title="Numbered List">
					<i className="fa-solid fa-list-ol"></i>
				</button>

				{/* H3 */}
				<button type="button" className={`ne-toolbar-btn ${format.h3 ? "active" : ""}`} onClick={toggleHeading} data-bs-toggle="tooltip" title="Heading 3">
					<i className="fa-solid fa-heading"></i>
				</button>

				{/* Quote */}
				<button type="button" className="ne-toolbar-btn" onClick={toggleQuote} data-bs-toggle="tooltip" title="Quote">
					<i className="fa-solid fa-quote-left"></i>
				</button>

				{/* Divider */}
				<button type="button" className="ne-toolbar-btn" onClick={insertDivider} data-bs-toggle="tooltip" title="Divider">
					<i className="fa-solid fa-minus"></i>
				</button>

				{/* Inline Code */}
				<button type="button" className="ne-toolbar-btn" onClick={insertInlineCode} data-bs-toggle="tooltip" title="Inline Code">
					<i className="fa-solid fa-code"></i>
				</button>

				{/* Image */}
				<button type="button" className="ne-toolbar-btn" onClick={handleImageClick} data-bs-toggle="tooltip" title="Insert Image">
					<i className="fa-solid fa-image"></i>
				</button>
			</div>

			<div
				ref={editorRef}
				className="ne-editor"
				contentEditable
				style={{ minHeight }}
				onInput={handleInput}
				onPaste={handlePaste}
				onKeyDown={handleKeyDown}
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

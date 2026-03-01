import React, { useEffect, useRef, useState } from "react";

const defaultFormat = {
	bold: false,
	italic: false,
	underline: false,
	ul: false,
	ol: false,
	h3: false,
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
      images.forEach(img => {
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
				ul: document.queryCommandState("insertUnorderedList"),
				ol: document.queryCommandState("insertOrderedList"),
				h3: document.queryCommandValue("formatBlock")?.toLowerCase().includes("h3"),
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
     INSERT IMAGE AT CURSOR
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

		// Move cursor after image
		range.setStartAfter(img);
		range.setEndAfter(img);
		selection.removeAllRanges();
		selection.addRange(range);

		handleInput();
	};

	/* ===============================
     HANDLE IMAGE CLICK
  =============================== */
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
					•List
				</button>

				<button type="button" className={`btn btn-outline-secondary ${format.ol ? "active" : ""}`} onClick={() => exec("insertOrderedList")}>
					1.List
				</button>

				<button type="button" className={`btn btn-outline-secondary ${format.h3 ? "active" : ""}`} onClick={() => exec("formatBlock", "h3")}>
					H3
				</button>

				<button type="button" className="btn btn-outline-secondary" onClick={handleImageClick}>
					🖼
				</button>
			</div>

			<div
				ref={editorRef}
				className="form-control"
				contentEditable
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

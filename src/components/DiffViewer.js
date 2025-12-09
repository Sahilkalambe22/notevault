// src/components/DiffViewer.js
import React from "react";
import { diffWords } from "diff";

/**
 * Decode HTML entities in a string using a DOM <textarea>.
 * Works in the browser.
 */
function decodeHtmlEntities(str = "") {
	try {
		const txt = document.createElement("textarea");
		txt.innerHTML = str;
		return txt.value;
	} catch (e) {
		return str;
	}
}

/**
 * Strip simple HTML tags (keeps text content). Then
 * normalize whitespace:
 *  - convert NBSP and other entities by decoding first
 *  - convert \u00A0 to normal space
 *  - collapse multiple spaces to a single space
 *  - preserve newline characters so pre-wrap still works
 */
function normalizeTextFromHtml(html = "") {
	// 1) decode entities first
	let decoded = decodeHtmlEntities(html);

	// 2) remove HTML tags
	decoded = decoded.replace(/<[^>]*>/g, "");

	// 3) replace non-breaking spaces with normal spaces
	decoded = decoded.replace(/\u00A0/g, " ");

	// 4) collapse sequences of spaces (but keep newlines)
	// We collapse runs of spaces/tabs into a single space, but keep \n
	decoded = decoded.replace(/[ \t]{2,}/g, " ");

	// 5) trim lines (optional) but keep line breaks
	decoded = decoded
		.split("\n")
		.map((ln) => ln.replace(/^\s+|\s+$/g, ""))
		.join("\n");

	return decoded;
}

const DiffViewer = ({ oldText = "", newText = "" }) => {
	// turn HTML into readable text for diffing
	const a = normalizeTextFromHtml(oldText);
	const b = normalizeTextFromHtml(newText);

	const diffs = diffWords(a, b);

	return (
		<div
			style={{
				padding: 10,
				background: "#fff",
				borderRadius: 8,
				border: "1px solid #ddd",
				maxHeight: 320,
				overflowY: "auto",
				whiteSpace: "pre-wrap",
				fontSize: 14,
				lineHeight: 1.45,
			}}
		>
			{diffs.map((part, i) => {
				const style = {
					backgroundColor: part.added ? "rgba(0, 200, 83, 0.18)" : part.removed ? "rgba(244, 67, 54, 0.18)" : "transparent",
					textDecoration: part.removed ? "line-through" : "none",
					padding: "0 2px",
					borderRadius: 3,
				};
				return (
					<span key={i} style={style}>
						{part.value}
					</span>
				);
			})}
		</div>
	);
};

export default DiffViewer;

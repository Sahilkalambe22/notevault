// src/components/DiffViewer.js

import React from "react";
import { diffWords } from "diff";
import "./DiffViewer.css";


/* ---------- HELPERS ---------- */

function decodeHtmlEntities(str = "") {
	try {
		const txt = document.createElement("textarea");
		txt.innerHTML = str;
		return txt.value;
	} catch {
		return str;
	}
}

function normalizeTextFromHtml(html = "") {
	let decoded = decodeHtmlEntities(html);

	decoded = decoded.replace(/<[^>]*>/g, "");
	decoded = decoded.replace(/\u00A0/g, " ");
	decoded = decoded.replace(/[ \t]{2,}/g, " ");

	decoded = decoded
		.split("\n")
		.map((ln) => ln.replace(/^\s+|\s+$/g, ""))
		.join("\n");

	return decoded;
}

/* ---------- COMPONENT ---------- */

const DiffViewer = ({ oldText = "", newText = "" }) => {
	const a = normalizeTextFromHtml(oldText);
	const b = normalizeTextFromHtml(newText);

	const diffs = diffWords(a, b);

	return (
		<div className="nv-diff-container">
			{diffs.map((part, i) => {
				let className = "nv-diff-normal";

				if (part.added) className = "nv-diff-added";
				if (part.removed) className = "nv-diff-removed";

				return (
					<span key={i} className={className}>
						{part.value}
					</span>
				);
			})}
		</div>
	);
};

export default DiffViewer;

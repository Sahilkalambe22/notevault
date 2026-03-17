import React, { useState, useRef, useEffect } from "react";
import "./Modal.css";

const TAG_ICON_MAP = {
	Work: "fa-solid fa-briefcase",
	Important: "fa-solid fa-triangle-exclamation",
	Personal: "fa-solid fa-user",
	Todo: "fa-solid fa-list-check",
	Priority: "fa-solid fa-bolt",
	Random: "fa-solid fa-shuffle",
};

const TAG_STYLE_MAP = {
	Work: { bg: "#2563eb", text: "#ffffff" }, // blue
	Important: { bg: "#ef4444", text: "#ffffff" }, // red
	Personal: { bg: "#8b5cf6", text: "#ffffff" }, // purple
	Todo: { bg: "#16a34a", text: "#ffffff" }, // green
	Priority: { bg: "#facc15", text: "#000000" }, // yellow
	Random: { bg: "#6b7280", text: "#ffffff" }, // gray
};

const TagSelectorModal = ({ show, onClose, onDone, tags, typeValue, customValue, onTypeChange, onCustomChange }) => {
	const [open, setOpen] = useState(false);
	const dropdownRef = useRef(null);

	useEffect(() => {
		const handleOutsideClick = (e) => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
				setOpen(false);
			}
		};
		document.addEventListener("mousedown", handleOutsideClick);
		return () => document.removeEventListener("mousedown", handleOutsideClick);
	}, []);

	if (!show) return null;

	const effectiveType = typeValue || "Random";
	const previewLabel = customValue?.trim() || effectiveType;
	const previewIcon = TAG_ICON_MAP[effectiveType];
	const previewStyle = TAG_STYLE_MAP[effectiveType];

	return (
		<div className="modal-backdrop-custom" onClick={onClose}>
			<div className="modal-card" style={{ width: 420 }} onClick={(e) => e.stopPropagation()}>
				<h4 style={{ marginBottom: 20 }}>Edit Tag</h4>

				<label className="small" style={{ color: "#94a3b8" }}>
					Tag Type (choose) & Name (optional)
				</label>

				{/* Custom Glass Dropdown */}
				<div style={{ display: "flex", gap: 12, marginTop: 8 }} ref={dropdownRef}>
					<div className="glass-dropdown">
						<div className="glass-dropdown-trigger" onClick={() => setOpen(!open)}>
							{typeValue || "Select Tag Type"}
							<i className="fa-solid fa-chevron-down"></i>
						</div>

						{open && (
							<div className="glass-dropdown-menu">
								{tags
									.filter((t) => t !== "Random")
									.map((t) => (
										<div
											key={t}
											className="glass-dropdown-item"
											onClick={() => {
												onTypeChange(t);
												setOpen(false);
											}}
										>
											{t}

											{typeValue === t && <i className="fa-solid fa-check" style={{ marginLeft: "auto", fontSize: "0.75rem" }}></i>}
										</div>
									))}
							</div>
						)}
					</div>

					{/* Preview */}
					<div
						className="tag-preview"
						style={{
							background: previewStyle.bg,
							color: previewStyle.text,
						}}
					>
						{previewIcon && <i className={previewIcon}></i>}
						{previewLabel}
					</div>
				</div>

				{/* Custom Input */}
				<input type="text" className="glass-input" placeholder="Custom tag (optional)" value={customValue} onChange={(e) => onCustomChange(e.target.value)} style={{ marginTop: 16 }} />

				<p className="modal-help">If custom name is set, it overrides the tag type.</p>

				<div className="modal-actions">
					<button className="btn-cancel" onClick={onClose}>
						Cancel
					</button>

					<button className="btn-primary" onClick={onDone}>
						Done
					</button>
				</div>
			</div>
		</div>
	);
};

export default TagSelectorModal;

import React from "react";

const TagSelector = ({ tags = [], tagColorMap = {}, typeValue = "", customValue = "", onTypeChange = () => {}, onCustomChange = () => {}, label = "Tag Type (choose) & Custom Name (optional)" }) => {
	// Cleaner, modern icons for all tags
	const TAG_ICON_MAP = {
		Work: "fa-solid fa-briefcase",
		Important: "fa-solid fa-triangle-exclamation",
		Personal: "fa-solid fa-user",
		Todo: "fa-solid fa-list-check",
		Random: "fa-solid fa-shuffle",
		Priority: "fa-solid fa-bolt",
	};

	const selectedVariant = typeValue && tagColorMap[typeValue];
	const previewIcon = TAG_ICON_MAP[typeValue] || null;

	const previewLabel = (customValue && customValue.trim()) || typeValue || "—";

	const isLight = selectedVariant === "light";

	return (
		<div className="mb-3">
			<label className="form-label small text-muted">{label}</label>

			<div className="d-flex gap-2 align-items-center flex-wrap">
				{/* Dropdown with icons */}
				<select className="form-select" style={{ maxWidth: 200 }} value={typeValue} onChange={(e) => onTypeChange(e.target.value)}>
					<option value="">Select Tag Type</option>

					{tags.map((t) => (
						<option key={t} value={t}>
							{t}
						</option>
					))}
				</select>

				{/* Preview badge (icon + text) */}
				<div
					className={`badge text-bg-${selectedVariant || "secondary"}`}
					style={{
						borderRadius: 999,
						padding: "0.35rem 0.7rem",
						minWidth: 80,
						textAlign: "center",
						color: isLight ? "black" : undefined,
						display: "flex",
						alignItems: "center",
						gap: "6px",
						fontSize: "0.9rem",
					}}
				>
					{previewIcon && <i className={previewIcon}></i>}
					{previewLabel}
				</div>

				{/* Custom name */}
				<input type="text" className="form-control" style={{ maxWidth: 200 }} placeholder="Custom tag (optional)" value={customValue} onChange={(e) => onCustomChange(e.target.value)} />
			</div>

			<div className="form-text mt-1">If custom name is set, it overrides the tag type. Leave it empty to use the selected type.</div>
		</div>
	);
};

export default TagSelector;

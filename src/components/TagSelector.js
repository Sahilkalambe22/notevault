//src/components/TagSelector.jsx
import React from "react";

const TagSelector = ({
  tags = [],
  tagColorMap = {},
  typeValue = "",
  customValue = "",
  onTypeChange = () => {},
  onCustomChange = () => {},
  label = "Tag Type (choose) & Custom Name (optional)",
}) => {
  /* Icon map */
  const TAG_ICON_MAP = {
    Work: "fa-solid fa-briefcase",
    Important: "fa-solid fa-triangle-exclamation",
    Personal: "fa-solid fa-user",
    Todo: "fa-solid fa-list-check",
    Priority: "fa-solid fa-bolt",
    Random: "fa-solid fa-shuffle", // fallback only
  };

  /* Determine preview values */
  const effectiveType = typeValue || "Random";
  const previewLabel =
    (customValue && customValue.trim()) || effectiveType;

  const previewVariant =
    tagColorMap[effectiveType] || "secondary";

  const previewIcon = TAG_ICON_MAP[effectiveType] || null;

  const isLight = previewVariant === "light";

  return (
    <div className="mb-3">
      <label className="form-label small text-muted">
        {label}
      </label>

      <div className="d-flex gap-2 align-items-center flex-wrap">
        {/* TAG TYPE SELECT (Random removed) */}
        <select
          className="form-select"
          style={{ maxWidth: 200 }}
          value={typeValue}
          onChange={(e) => onTypeChange(e.target.value)}
        >
          <option value="">Select Tag Type</option>

          {tags
            .filter((t) => t !== "Random") // ✅ IMPORTANT FIX
            .map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
        </select>

        {/* PREVIEW BADGE */}
        <div
          className={`badge text-bg-${previewVariant}`}
          style={{
            borderRadius: 999,
            padding: "0.35rem 0.7rem",
            minWidth: 80,
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.9rem",
            color: isLight ? "#000" : undefined,
          }}
        >
          {previewIcon && <i className={previewIcon}></i>}
          {previewLabel}
        </div>

        {/* CUSTOM TAG INPUT */}
        <input
          type="text"
          className="form-control"
          style={{ maxWidth: 200 }}
          placeholder="Custom tag (optional)"
          value={customValue}
          onChange={(e) => onCustomChange(e.target.value)}
        />
      </div>

      <div className="form-text mt-1">
        Custom name overrides the tag label.  
        Leave it empty to use the selected type.
      </div>
    </div>
  );
};

export default TagSelector;

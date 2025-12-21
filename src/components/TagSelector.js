import React from "react";

const TagSelector = ({
  tags = [],
  tagColorMap = {},
  typeValue = "",
  customValue = "",
  onTypeChange,
  onCustomChange,
}) => {
  const TAG_ICON_MAP = {
    Work: "fa-solid fa-briefcase",
    Important: "fa-solid fa-triangle-exclamation",
    Personal: "fa-solid fa-user",
    Todo: "fa-solid fa-list-check",
    Priority: "fa-solid fa-bolt",
    Random: "fa-solid fa-shuffle",
  };

  const effectiveType = typeValue || "Random";
  const previewLabel = customValue || effectiveType;
  const previewVariant = tagColorMap[effectiveType] || "secondary";
  const previewIcon = TAG_ICON_MAP[effectiveType];

  return (
    <>
      <select
        className="form-select mb-2"
        value={typeValue}
        onChange={(e) => onTypeChange(e.target.value)}
      >
        <option value="">Select Tag Type</option>
        {tags.filter(t => t !== "Random").map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      <input
        className="form-control mb-3"
        placeholder="Custom tag (optional)"
        value={customValue}
        onChange={(e) => onCustomChange(e.target.value)}
      />

      <span className={`badge text-bg-${previewVariant}`}>
        {previewIcon && <i className={`${previewIcon} me-1`} />}
        {previewLabel}
      </span>
    </>
  );
};

export default TagSelector;

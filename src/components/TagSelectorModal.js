import React from "react";

const TAG_ICON_MAP = {
  Work: "fa-solid fa-briefcase",
  Important: "fa-solid fa-triangle-exclamation",
  Personal: "fa-solid fa-user",
  Todo: "fa-solid fa-list-check",
  Priority: "fa-solid fa-bolt",
  Random: "fa-solid fa-shuffle",
};

const TagSelectorModal = ({
  show,
  onClose,
  onDone,
  tags,
  tagColorMap,
  typeValue,
  customValue,
  onTypeChange,
  onCustomChange,
}) => {
  if (!show) return null;

  const effectiveType = typeValue || "Random";
  const previewLabel = customValue?.trim() || effectiveType;
  const previewVariant = tagColorMap[effectiveType] || "secondary";
  const previewIcon = TAG_ICON_MAP[effectiveType];
  const isLight = previewVariant === "light";

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          {/* HEADER */}
          <div className="modal-header">
            <h5 className="modal-title">Edit Tag</h5>
            <button className="btn-close" onClick={onClose} />
          </div>

          {/* BODY */}
          <div className="modal-body">
            <label className="form-label small text-muted">
              Tag Type (choose) & Name (optional)
            </label>

            {/* SELECT + BADGE */}
            <div className="d-flex gap-2 align-items-center mb-2">
              <select
                className="form-select"
                style={{ maxWidth: 220 }}
                value={typeValue}
                onChange={(e) => onTypeChange(e.target.value)}
              >
                <option value="">Select Tag Type</option>
                {tags
                  .filter((t) => t !== "Random")
                  .map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
              </select>

              <span
                className={`badge text-bg-${previewVariant}`}
                style={{
                  borderRadius: 999,
                  padding: "0.35rem 0.75rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  color: isLight ? "#000" : undefined,
                }}
              >
                {previewIcon && <i className={previewIcon}></i>}
                {previewLabel}
              </span>
            </div>

            {/* CUSTOM INPUT */}
            <input
              type="text"
              className="form-control"
              placeholder="Custom tag (optional)"
              value={customValue}
              onChange={(e) => onCustomChange(e.target.value)}
            />

            <div className="form-text mt-2">
              If custom name is set, it overrides the tag type.
              Leave it empty to use the selected type.
            </div>
          </div>

          {/* FOOTER */}
          <div className="modal-footer">
            <button className="btn btn-primary" onClick={onDone}>
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TagSelectorModal;

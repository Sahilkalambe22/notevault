import React, { useEffect, useState } from "react";

const ReminderModal = ({ show, initialValue, onSave, onRemove, onClose }) => {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (initialValue) {
      const d = new Date(initialValue);
      if (!Number.isNaN(d.getTime())) {
        setValue(d.toISOString().slice(0, 16));
      }
    } else {
      setValue("");
    }
  }, [initialValue, show]);

  if (!show) return null;

  return (
    <div className="modal-backdrop-custom">
      <div className="modal-card">
        <h5 className="mb-3">⏰ Set Reminder</h5>

        <input
          type="datetime-local"
          className="form-control mb-3"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />

        <div className="d-flex justify-content-end gap-2">
          {initialValue && (
            <button className="btn btn-outline-danger" onClick={onRemove}>
              Remove
            </button>
          )}
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            disabled={!value}
            onClick={() => onSave(new Date(value).toISOString())}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReminderModal;

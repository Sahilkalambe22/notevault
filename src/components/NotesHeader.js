import React from "react";

const NotesHeader = ({ onAddNote }) => {
  return (
    <div className="notes-header">

      <div className="notes-header-left">
        <h4 className="notes-title">Your Notes</h4>
      </div>

      <div className="notes-header-right">
        <button
          type="button"
          className="notes-add-btn"
          onClick={onAddNote}
        >
          + Add Note
        </button>
      </div>

    </div>
  );
};

export default NotesHeader;

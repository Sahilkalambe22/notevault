// src/components/NotesFilters.jsx

import React from "react";

const NotesFilters = ({
  selectedTag,
  onTagChange,
  uniqueTags,
  search,
  onSearchChange,
}) => {
  return (
    <div className="notes-filters">

      <div className="notes-filter-item">
        <select
          className="notes-select"
          value={selectedTag}
          onChange={(e) => onTagChange(e.target.value)}
        >
          <option value="">All Tags</option>
          {uniqueTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>

      <div className="notes-filter-item">
        <input
          type="text"
          className="notes-search"
          placeholder="Search by title, tag, or description"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

    </div>
  );
};

export default NotesFilters;

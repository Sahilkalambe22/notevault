// src/components/NotesFilters.jsx
import React from "react";

const NotesFilters = ({ selectedTag, onTagChange, uniqueTags, search, onSearchChange }) => {
	return (
		<div className="d-flex flex-column flex-md-row gap-2">
			{/* Tag filter dropdown – dynamic options */}
			<select className="form-select w-100 w-md-auto" style={{ borderRadius: "10px" }} value={selectedTag} onChange={(e) => onTagChange(e.target.value)}>
				<option value="">All Tags</option>
				{uniqueTags.map((tag) => (
					<option key={tag} value={tag}>
						{tag}
					</option>
				))}
			</select>

			{/* Search input */}
			<input type="text" className="form-control w-100 w-md-auto" name="search" placeholder="Search by title, tag, or description" style={{ borderRadius: "10px" }} value={search} onChange={(e) => onSearchChange(e.target.value)} />
		</div>
	);
};

export default NotesFilters;

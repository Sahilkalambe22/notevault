// src/components/ReminderBadge.jsx

import React from "react";

const ReminderBadge = ({ reminderAt }) => {
	if (!reminderAt) return null;

	const date = new Date(reminderAt);
	if (Number.isNaN(date.getTime())) return null;

	const now = Date.now();
	const isPast = date.getTime() < now;

	const label = date.toLocaleString(undefined, {
		day: "2-digit",
		month: "short",
		hour: "2-digit",
		minute: "2-digit",
	});

	const badgeClass = isPast ? "text-bg-secondary" : "text-bg-warning";

	return (
		<span className={`badge rounded-pill ${badgeClass}`} title={`Reminder at ${date.toLocaleString()}`} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
			<i className="fa-regular fa-clock" />
			<span>{label}</span>
		</span>
	);
};

export default ReminderBadge;

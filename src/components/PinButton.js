import React from "react";

const PinButton = ({ isPinned, onToggle }) => {
	return (
		<i
			className="fa-solid fa-thumbtack"
			style={{
				cursor: "pointer",
				color: isPinned ? "red" : "#555",
				transform: isPinned ? "rotate(0deg)" : "rotate(40deg)",
				transition: "0.2s",
				zIndex: 2,
				position: "absolute",
				top: "8px",
				right: "10px",
			}}
			title={isPinned ? "Unpin note" : "Pin note"}
			onClick={onToggle}
		></i>
	);
};

export default PinButton;

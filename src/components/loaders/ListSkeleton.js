import React from "react";
import "./Skeleton.css";

const ListSkeleton = ({ count = 4 }) => {
	return (
		<>
			{[...Array(count)].map((_, i) => (
				<div
					key={i}
					className="skeleton skeleton-list-item"
					style={{
						marginBottom: "14px",
						height: "18px",
						borderRadius: "6px",
					}}
				></div>
			))}
		</>
	);
};

export default ListSkeleton;

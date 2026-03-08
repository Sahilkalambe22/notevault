import React from "react";
import "./Skeleton.css";

const CardSkeleton = ({ count = 6 }) => {
	return (
		<>
			{[...Array(count)].map((_, i) => (
				<div className="col-xl-4 col-lg-4 col-md-6 col-sm-12 mb-4" key={i}>
					<div className="card note-card skeleton-card">
						<div className="skeleton-tag"></div>

						<div className="skeleton-title"></div>

						<div className="skeleton-text"></div>

						<div className="skeleton-text short"></div>
					</div>
				</div>
			))}
		</>
	);
};

export default CardSkeleton;

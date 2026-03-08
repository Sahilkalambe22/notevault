import React from "react";
import "./Skeleton.css";

const VersionPreviewSkeleton = () => {
  return (
    <div className="vh-preview-skeleton">

      <div className="skeleton skeleton-title"></div>

      <div className="skeleton skeleton-text"></div>
      <div className="skeleton skeleton-text"></div>
      <div className="skeleton skeleton-text"></div>

      <div className="skeleton skeleton-editor"></div>

    </div>
  );
};

export default VersionPreviewSkeleton;
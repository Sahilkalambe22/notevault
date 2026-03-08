import React from "react";
import "./Skeleton.css";

const EditorSkeleton = () => {
  return (
    <div className="ne-editor-page">
      <div className="ne-editor-card">

        {/* Top bar */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="skeleton skeleton-toolbar"></div>
          <div className="skeleton skeleton-toolbar" style={{width:"120px"}}></div>
        </div>

        {/* Title */}
        <div className="skeleton skeleton-title" style={{height:"26px", marginBottom:"25px"}}></div>

        {/* Toolbar */}
        <div className="skeleton skeleton-toolbar" style={{width:"60%", marginBottom:"20px"}}></div>

        {/* Editor body */}
        <div className="skeleton skeleton-editor"></div>

      </div>
    </div>
  );
};

export default EditorSkeleton;
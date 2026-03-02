import React from "react";
import "./UserHeader.css";

const UserHeader = () => {
  const name = localStorage.getItem("name");

  if (!name) return null;

  return (
    <div className="profile-header">
      <div className="profile-header-content">
        <div>
          <h1 className="profile-title">Welcome back, {name}</h1>
          <p className="profile-subtitle">
            Manage your notes, organize your ideas, and stay productive.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserHeader;

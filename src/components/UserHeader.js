import React from "react";

const UserHeader = () => {
  const name = localStorage.getItem("name");

  if (!name) return null;

  return (
    <div className="user-header" >
      Welcome {name}
    </div>
  );
};

export default UserHeader;

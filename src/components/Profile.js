import React from "react";
import Notes from "./Notes";

const Profile = (props) => {
  const name = localStorage.getItem("name");

  return (
    <div className="container my-3">
      <h2>Welcome {name}</h2>
      <Notes showAlert={props.showAlert} />
    </div>
  );
};

export default Profile;

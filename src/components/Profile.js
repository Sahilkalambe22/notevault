import React from "react";
import Notes from "./Notes";


const Profile = (props) => {

  return (
    <div className="container my-3">
      <Notes showAlert={props.showAlert} />
    </div>
  );
};

export default Profile;

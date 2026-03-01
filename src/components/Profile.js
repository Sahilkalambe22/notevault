import React from "react";
import Notes from "./Notes";
import UserHeader from "./UserHeader";


const Profile = (props) => {

  return (
    <div className="container my-3">
      <UserHeader />
      <Notes showAlert={props.showAlert} />
    </div>
  );
};

export default Profile;

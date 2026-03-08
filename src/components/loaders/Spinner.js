import React from "react";
import "./Spinner.css";

const Spinner = ({ text = "Loading..." }) => {
  return (
    <div className="nv-spinner">
      <div className="nv-spinner-ring"></div>
      <p className="nv-spinner-text">{text}</p>
    </div>
  );
};

export default Spinner;
import React from "react";

export default function Alert(props) {
  if (!props.alert) return null;

  return (
    <div
      className={`nv-alert alert alert-${props.alert.type} fade show`}
      role="alert"
    > 
      {props.alert.type}: {props.alert.msg}
    </div>
  );
}
import React from 'react'

export default function Alert(props) {
  return (
    <div className="container" style = {{height:'90px'}}>
        {props.alert && <div className={`alert alert-${props.alert.type} alert-dismissible fade show`} role="alert" style={{ position:"fixed", top:"56px", left:0, width:"100%", zIndex:1050 }}>
    {props.alert.type}:{props.alert.msg}
    </div>}
    </div>
  )
}

 

/* eslint-disable react/prop-types */
// import React, { useState } from "react";
import { MdNotListedLocation } from "react-icons/md";
import "./Dialog.css";

const Dialog = ({ setOpenDialog, message, action }) => {
  return (
    <div className="dialogContainer">
      {" "}
      <div className="DialogBackground">
        <div className="DialogContainer">
          <div className="CloseDialog">
            {" "}
            <button onClick={() => setOpenDialog(false)}>X</button>
          </div>
          <h2>{message} </h2>
          <h2>
            <MdNotListedLocation className="question" fontSize="large" />
          </h2>{" "}
          <div className="action">
            <button className="red" onClick={() => setOpenDialog(false)}>
              No
            </button>
            <button className="yes" onClick={action}>
              Yes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dialog;

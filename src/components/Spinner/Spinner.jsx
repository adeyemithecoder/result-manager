import React from "react";
import { FaSpinner } from "react-icons/fa";
import "./Spinner.css"; // Optional for animation styling

const Spinner = ({ color = "#4db5ffz", size = "3rem" }) => {
  return (
    <div className="spinner-container">
      <FaSpinner
        className="spinner-icon"
        style={{ color: color, fontSize: size }}
      />
    </div>
  );
};

export default Spinner;

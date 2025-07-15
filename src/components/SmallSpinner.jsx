import React from "react";

const SmallSpinner = ({ small }) => (
  <div
    className={`${
      small ? "w-4 h-4" : "w-8 h-8"
    } border-2 border-white border-t-transparent rounded-full animate-spin`}
  />
);

export default SmallSpinner


import React from "react";

const Spinner = () => {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-10 h-10 border-4 border-green-700 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default Spinner;

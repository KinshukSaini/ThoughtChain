import React from "react";

const InputBox = () => {
  return (
    <div className="flex flex-col">
      {/* text input */}
      <div className="bg-yellow-700 p-2">
        <input type="text" />
      </div>
      
      
      {/* enter button */}
      <div className="bg-yellow-700 p-2">
        <button>Enter</button>
      </div>
    </div>
  );
};

export default InputBox;

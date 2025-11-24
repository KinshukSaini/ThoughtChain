import React from "react";

const InputBox = () => {
  return (
    <div className="flex flex-row items-center space-x-2 rounded-3xl">
      {/* text input */}
      <div className=" m-5 mr-3 p-4 border-gray-400 border shadow-[0_5px_50px_rgba(255,255,255,1)] shadow-gray-700 flex-1 rounded-full">
        <input type="text" />
      </div>
      {/* enter button */}
      <div className="">
        <button className="bg-[#1e1e1f] hover:bg-[#29292b] rounded-full text-white p-4 m-2 ml-0 ">Enter</button>
      </div>
    </div>
  );
};

export default InputBox;

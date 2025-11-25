'use client';

import React, { useState } from "react";

type InputBoxProps = {
  onSendMessage: (message: string) => void;
};

const InputBox = ({ onSendMessage }: InputBoxProps) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-row items-center space-x-2 rounded-3xl">
      {/* text input */}

        <input 
          className=" m-5 mr-3 p-4 border-gray-400 border shadow-[0_5px_50px_rgba(255,255,255,1)] shadow-gray-700 flex-1 rounded-full text-gray-300"
          type="text" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
        />
 
      {/* enter button */}
      <div>
        <button onClick={handleSubmit} className="bg-[#1e1e1f] hover:bg-[#29292b] rounded-full text-white p-4 m-2 ml-0 ">Enter</button>
      </div>
    </div>
  );
};

export default InputBox;

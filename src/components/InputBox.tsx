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
    <div className="flex flex-col border-2 border-[#29292b] rounded-4xl my-2 lg:my-8 px-2 py-2 w-full max-w-full lg:max-w-[40vw]">
      <div className="flex items-center gap-2 rounded-3xl">
        {/* text input */}
        <input 
          className="mr-3 p-4 flex-1 rounded-full text-gray-300 outline-none focus:outline-none"
          type="text" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
        />
 
        {/* send button */}
        <button onClick={handleSubmit} className="bg-[#1e1e1f] hover:bg-[#29292b] rounded-full text-white p-3 m-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default InputBox;

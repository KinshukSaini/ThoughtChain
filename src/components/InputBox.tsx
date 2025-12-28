'use client';

import React, { useState, useRef } from "react";

type InputBoxProps = {
  onSendMessage: (message: string, files?: File[]) => void;
};

const InputBox = ({ onSendMessage }: InputBoxProps) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (inputValue.trim() || selectedFiles.length > 0) {
      onSendMessage(inputValue, selectedFiles);
      setInputValue('');
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col border-2 border-[#29292b] rounded-4xl my-8 px-2 py-2 w-full max-w-[95vw] md:max-w-[40vw]">
      {/* File Preview */}
      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mx-5 mb-2">
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">
              <span className="max-w-[150px] truncate">{file.name}</span>
              <button 
                onClick={() => removeFile(index)}
                className="ml-2 text-red-400 hover:text-red-300"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col space-y-2 rounded-3xl">
        {/* File upload button */}
        
        {/* text input */}
        <input 
          className="mr-3 p-4 flex-1 rounded-full text-gray-300 outline-none focus:outline-none"
          type="text" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
        />
 
        {/* enter button */}
        <div className="flex justify-between items-center">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="ml-5 bg-[#1e1e1f] hover:bg-[#29292b] rounded-full text-white p-3"
            title="Upload files"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          <div>
            
          <input 
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
            <button onClick={handleSubmit} className="bg-[#1e1e1f] hover:bg-[#29292b] rounded-full text-white p-3 m-2 ml-0 ">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputBox;

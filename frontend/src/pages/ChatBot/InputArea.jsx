import React, { useState } from "react";
import TextareaAutoSize from "react-textarea-autosize";
import { FiSend } from "react-icons/fi";

function InputArea({ onSendMessage }) {
  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex px-6 py-4 bg-white rounded-b-2xl shadow-md gap-3 border-t-2 border-gray-100">
      <TextareaAutoSize
        minRows={1}
        maxRows={6}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
        className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-transparent text-base resize-none transition-all duration-200"
        placeholder="Type your message here... (Press Enter to send)"
      />
      <button
        onClick={handleSend}
        disabled={!inputValue.trim()}
        className="bg-[#27AE60] hover:bg-[#1E8449] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg px-6 py-3 flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-md"
      >
        <FiSend className="text-xl" />
      </button>
    </div>
  );
}

export default InputArea;
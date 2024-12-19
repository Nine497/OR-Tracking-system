import React from "react";

const LanguageSelector = ({ changeLanguage }) => {
  return (
    <div className="absolute top-4 right-4 flex space-x-2">
      <button onClick={() => changeLanguage("en")} className="text-sm p-2">
        English
      </button>
      <button onClick={() => changeLanguage("th")} className="text-sm p-2">
        ไทย
      </button>
      <button onClick={() => changeLanguage("bs")} className="text-sm p-2">
        Bahasa
      </button>
    </div>
  );
};

export default LanguageSelector;

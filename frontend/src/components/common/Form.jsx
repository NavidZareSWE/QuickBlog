import React from "react";

const Form = ({ placeholder, required }) => {
  return (
    <form className="flex justify-between max-w-lg max-sm:scale-75 scale-90 mx-auto border border-gray-300 bg-white rounded overflow-hidden">
      <input
        type="text"
        placeholder={placeholder}
        required={required}
        className="w-full pl-4 outline-none"
      />
      <button
        type="submit"
        className="bg-primary text-white px-8 py-2 m-1.5 rounded hover:scale-105 transition-all cursor-pointer"
      >
        Search
      </button>
    </form>
  );
};

export default Form;

import React, { useState } from "react";
import FeedbackModal from "./FeedbackModal";

const Footer = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <footer className="bg-gray-800 text-white py-4 ">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0 px-4">
        <p className="text-center md:text-left">
          &copy; 2025 Museo ning Angeles. All rights reserved.
        </p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-yellow-800 text-white px-4 py-2 rounded hover:bg-yellow-900"
        >
          Provide Feedback
        </button>
      </div>
      {isModalOpen && <FeedbackModal closeModal={() => setIsModalOpen(false)} />}
    </footer>
  );
};

export default Footer;

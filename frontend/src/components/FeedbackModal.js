import React, { useState } from "react";
import Swal from "sweetalert2";

const FeedbackModal = ({ closeModal }) => {
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(5); // Default rating

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    // Retrieve the logged-in user from localStorage.
    // If no user is logged in, default to an anonymous account.
    const userData = localStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : { id: 1, username: "Anonymous" };
    console.log("Submitting feedback as user:", user); // Debug output

    try {
      const response = await fetch("https://api.museoningangeles.com/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback, rating, user_id: user.id }),
      });
      const data = await response.json();
      // Use SweetAlert2 to display a success message
      Swal.fire({
        title: "Feedback Submitted!",
        text: data.message,
        icon: "success",
        confirmButtonText: "OK",
      });
      closeModal();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      // Use SweetAlert2 to display an error message
      Swal.fire({
        title: "Submission Error",
        text: error.message,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Provide Feedback</h2>
        <textarea
          className="w-full p-2 border border-gray-300 rounded mb-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows="4"
          placeholder="Write your feedback..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        ></textarea>
        <div className="mb-4">
          <label className="block font-medium text-gray-800">Rate Us:</label>
          <select
            className="border border-gray-300 p-2 rounded w-full bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5].map((num) => (
              <option key={num} value={num}>
                {num} Star{num > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end">
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600 transition duration-300"
            onClick={closeModal}
          >
            Cancel
          </button>
          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition duration-300"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;

import React, { useState, useEffect } from "react";

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await fetch("https://api.museoningangeles.com/api/feedback");
        if (!response.ok) {
          throw new Error("Failed to fetch feedbacks");
        }
        const data = await response.json();
        console.log("Fetched feedbacks:", data);
        setFeedbacks(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  const calculateAverageRating = () => {
    if (feedbacks.length === 0) return 0;
    const totalRating = feedbacks.reduce((sum, item) => sum + item.rating, 0);
    return (totalRating / feedbacks.length).toFixed(1);
  };

  // Pagination calculations
  const totalPages = Math.ceil(feedbacks.length / itemsPerPage);
  const currentFeedbacks = feedbacks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-white-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
          User Feedback
        </h1>
        {loading ? (
          <p className="text-center text-lg text-gray-600">Loading feedbacks...</p>
        ) : error ? (
          <p className="text-center text-red-500 text-lg">Error: {error}</p>
        ) : feedbacks.length === 0 ? (
          <p className="text-center text-gray-600">No feedback available.</p>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-center">
              <span className="text-xl font-semibold">Average Rating:</span>
              <span className="ml-2 text-3xl font-bold text-yellow-500">
                {calculateAverageRating()} ⭐
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {currentFeedbacks.map((item) => (
                <div key={item.id} className="border p-4 rounded-lg shadow-sm bg-gray-50">
                  <div className="mb-2">
                    <span className="font-semibold">Rating:</span> {item.rating} Star
                    {item.rating > 1 ? "s" : ""}
                  </div>
                  <div>
                    <span className="font-semibold">Feedback:</span> {item.feedback_text}
                  </div>
                </div>
              ))}
            </div>
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-6">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded ${
                    currentPage === 1
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-yellow-600 text-white hover:bg-yellow-700"
                  }`}
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded ${
                      page === currentPage
                        ? "bg-yellow-700 text-white"
                        : "bg-yellow-600 text-white hover:bg-yellow-700"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded ${
                    currentPage === totalPages
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-yellow-600 text-white hover:bg-yellow-700"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Feedback;

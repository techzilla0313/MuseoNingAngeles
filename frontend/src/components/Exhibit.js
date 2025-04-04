import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Exhibit = () => {
  const [exhibits, setExhibits] = useState({ current: null, upcoming: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedExhibit, setSelectedExhibit] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExhibits = async () => {
      try {
        const response = await fetch("https://api.museoningangeles.com/api/exhibits");
        if (!response.ok) {
          throw new Error("Failed to fetch exhibits");
        }
        const data = await response.json();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const sortedExhibits = data.sort(
          (a, b) => new Date(a.exhibit_date) - new Date(b.exhibit_date)
        );

        let currentExhibit = null;
        for (let i = sortedExhibits.length - 1; i >= 0; i--) {
          const exhibitDate = new Date(sortedExhibits[i].exhibit_date);
          if (exhibitDate < today) {
            currentExhibit = sortedExhibits[i];
            break;
          }
        }

        const upcomingExhibits = sortedExhibits
          .filter((exhibit) => new Date(exhibit.exhibit_date) >= today)
          .slice(0, 3);

        setExhibits({ current: currentExhibit, upcoming: upcomingExhibits });
      } catch (error) {
        setError(error.message);
        console.error("Error fetching exhibits:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExhibits();
  }, []);

  const handleViewAll = () => {
    navigate("/all-exhibits");
  };

  const handleExhibitClick = (exhibit) => {
    setSelectedExhibit(exhibit);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedExhibit(null);
  };

  if (loading) {
    return (
      <div className="text-center text-gray-800">Loading exhibits...</div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">Error: {error}</div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen text-gray-800">
      {/* White background container covering current exhibit & button */}
      <div className="container mx-auto p-6 bg-white/70 w-full max-w-full p-6">
        {/* Current Exhibit */}
        {exhibits.current && (
          <div className="mb-10 flex justify-center">
            <div className="w-full md:w-2/3 lg:w-1/2">
              <h2 className="text-4xl font-serif mb-4 text-center">
                Current Exhibit
              </h2>
              <div
                className="border border-[#8B4513] rounded-lg p-6 shadow-lg transform hover:scale-105 transition-all duration-300 cursor-pointer bg-yellow-800 bg-opacity-90"
                onClick={() => handleExhibitClick(exhibits.current)}
              >
                <img
                  src={`https://api.museoningangeles.com${exhibits.current.image}`}
                  alt={exhibits.current.name}
                  className="w-full h-[300px] object-contain rounded-lg mb-4"
                />
                <h2 className="text-xl font-bold mb-2 truncate">
                  {exhibits.current.name}
                </h2>
                <p className="text-gray-300">
                  {new Date(exhibits.current.exhibit_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* View All Button */}
        <div className="flex justify-center mt-10">
          <button
            className="px-6 py-3 bg-yellow-800 text-white rounded-lg shadow-md hover:bg-yellow-900 transition-all duration-300"
            onClick={handleViewAll}
          >
            View All Exhibits
          </button>
        </div>
      </div>

      {/* Exhibit Modal */}
      {isModalOpen && selectedExhibit && (
        <div className="fixed inset-0 flex items-start md:items-center justify-center bg-black bg-opacity-75 p-4 pt-16 md:pt-0 overflow-y-auto">
          <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg max-w-4xl w-full relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-2 right-2 text-white text-xl"
              onClick={handleCloseModal}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4">
              {selectedExhibit.name}
            </h2>
            <img
              src={`https://api.museoningangeles.com${selectedExhibit.image}`}
              alt={selectedExhibit.name}
              className="w-full h-auto md:h-[500px] object-contain rounded mb-4"
            />
            <p className="text-gray-300 mb-2">
              {new Date(selectedExhibit.exhibit_date).toLocaleDateString()}
            </p>
            <p className="text-gray-400">
              {selectedExhibit.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exhibit;

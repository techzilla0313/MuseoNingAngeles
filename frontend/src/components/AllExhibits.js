import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AllExhibits = () => {
  const navigate = useNavigate();
  const [exhibits, setExhibits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredExhibits, setFilteredExhibits] = useState([]);
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [selectedExhibit, setSelectedExhibit] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchExhibits = async () => {
      try {
        const response = await fetch("https://api.museoningangeles.com/api/exhibits");
        if (!response.ok) {
          throw new Error("Failed to fetch exhibits");
        }
        const data = await response.json();
        setExhibits(data);
        setFilteredExhibits(data); // Initially show all exhibits
      } catch (error) {
        setError(error.message);
        console.error("Error fetching exhibits:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExhibits();
  }, []);

  const handleFilterChange = () => {
    let filtered = exhibits;

    if (filterMonth) {
      filtered = filtered.filter((exhibit) => {
        const exhibitMonth = new Date(exhibit.exhibit_date).getMonth() + 1;
        return exhibitMonth === parseInt(filterMonth, 10);
      });
    }

    if (filterYear) {
      filtered = filtered.filter((exhibit) => {
        const exhibitYear = new Date(exhibit.exhibit_date).getFullYear();
        return exhibitYear === parseInt(filterYear, 10);
      });
    }

    setFilteredExhibits(filtered);
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
    return <div className="text-center">Loading exhibits...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        Error: {error}
        <p>Please try again later.</p>
      </div>
    );
  }

  return (
    <>
      {/* Back Arrow positioned below the navbar */}
      <div className="fixed top-[80px] left-6 z-[10000]">
        <button
          onClick={() => navigate("/exhibits")}
          className="text-yellow-900 text-4xl "
          aria-label="Back to Exhibit Page"
        >
          ←
        </button>
      </div>

      {/* Main Content Container */}
      <div className="container mx-auto p-4 mt-16">
        <h1 className="text-4xl font-serif font-semibold mb-6 text-center">
          All Exhibits
        </h1>

        {/* Filter Section */}
        <div className="flex justify-center space-x-4 mb-6">
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">All Months</option>
            <option value="1">January</option>
            <option value="2">February</option>
            <option value="3">March</option>
            <option value="4">April</option>
            <option value="5">May</option>
            <option value="6">June</option>
            <option value="7">July</option>
            <option value="8">August</option>
            <option value="9">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
          </select>

          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">All Years</option>
            <option value="2020">2020</option>
            <option value="2021">2021</option>
            <option value="2022">2022</option>
            <option value="2023">2023</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
          </select>

          <button
            onClick={handleFilterChange}
            className="bg-yellow-800 hover:bg-yellow-900 text-white px-6 py-2 rounded"
          >
            Apply Filters
          </button>
        </div>

        {/* Exhibits List */}
        <div className="flex flex-wrap justify-center gap-8">
          {filteredExhibits.map((exhibit) => (
            <div
              key={exhibit.id}
              className="cursor-pointer w-full sm:w-80 md:w-96 lg:w-96 border rounded-lg p-6 shadow-lg transition-all hover:scale-105 bg-yellow-900 bg-opacity-50"
              onClick={() => handleExhibitClick(exhibit)}
              style={{ height: "500px" }}
            >
              <div className="w-full h-80 relative">
                <img
                  src={`https://api.museoningangeles.com${exhibit.image}`}
                  alt={exhibit.name}
                  className="w-full h-full object-contain object-center rounded mb-6"
                />
              </div>
              <h2
                className="text-2xl font-semibold mb-2 overflow-hidden"
                style={{
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                }}
              >
                {exhibit.name}
              </h2>
              <p
                className="text-gray-600 text-lg overflow-hidden"
                style={{
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  height: "60px",
                }}
              >
                {exhibit.description}
              </p>
            </div>
          ))}
        </div>

        {/* Modal */}
        {isModalOpen && selectedExhibit && (
          <div className="fixed inset-0 flex items-start md:items-center justify-center bg-black bg-opacity-75 p-4 pt-16 md:pt-0 overflow-y-auto">
            <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg max-w-4xl w-full relative max-h-[90vh] overflow-y-auto">
              {/* Close Button - Fixed for better visibility */}
              <button
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-white text-2xl bg-gray-800 hover:bg-gray-700 rounded-full"
                onClick={handleCloseModal}
              >
                &times;
              </button>
          
              {/* Modal Content */}
              <h2 className="text-2xl font-bold mb-4 text-center">
                {selectedExhibit.name}
              </h2>
              <img
                src={`https://api.museoningangeles.com${selectedExhibit.image}`}
                alt={selectedExhibit.name}
                className="w-full h-auto md:h-[500px] object-contain rounded mb-4"
              />
              <p className="text-gray-300 mb-2 text-center">
                {new Date(selectedExhibit.exhibit_date).toLocaleDateString()}
              </p>
              <p className="text-gray-400 text-center">
                {selectedExhibit.description}
              </p>
            </div>
          </div>        
        )}
      </div>
    </>
  );
};

export default AllExhibits;

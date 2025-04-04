// src/components/GroupedArtsPage.js
import React, { useState, useEffect, useRef } from "react";
import ArtCarousel from "./ArtCarousel";
import CustomQuiz from "./CustomQuiz";
import Puzzle from "./Puzzle";
import Exhibit from "./Exhibit";
import { CircularProgress } from "@mui/material";
import { quiz } from "./quizData";
import { FaChevronDown } from "react-icons/fa"; // Import arrow icon

const GroupedArtsPage = () => {
  const [groupedArts, setGroupedArts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openGroups, setOpenGroups] = useState([]);
  const [quizOpen, setQuizOpen] = useState(false);
  const [puzzleOpen, setPuzzleOpen] = useState(false);

  // Create a reference for the exhibit section
  const exhibitRef = useRef(null);

  useEffect(() => {
    const fetchGroupedArts = async () => {
      try {
        const response = await fetch("https://api.museoningangeles.com/api/artGroups");
        console.log("Response status:", response.status);
        const data = await response.json();
        console.log("Fetched art groups:", data);
        setGroupedArts(Array.isArray(data) ? data : data.groups || []);
        setOpenGroups(
          new Array(
            Array.isArray(data) ? data.length : data.groups?.length || 0
          ).fill(true)
        );
      } catch (err) {
        console.error("Error fetching art groups:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupedArts();
  }, []);

  const toggleGroup = (index) => {
    setOpenGroups((prev) => {
      const newState = [...prev];
      newState[index] = !newState[index];
      return newState;
    });
  };

  // Function to smoothly scroll to the exhibit section
  const scrollToExhibit = () => {
    if (exhibitRef.current) {
      exhibitRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-lg font-medium">Loading...</div>
    );
  }
  if (error) {
    return (
      <div className="text-center py-12 text-red-600 text-lg">Error: {error}</div>
    );
  }

  return (
    <div className="font-serif">
      {/* Header */}
      <div
        className="relative w-full h-[93vh] bg-cover bg-center bg-scroll sm:bg-fixed flex items-center justify-center"
        style={{
          backgroundImage: "url('/images/artsbg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/70 w-full max-w-full p-6 text-center">
            <h1 className="text-yellow-900 text-4xl sm:text-5xl font-bold">
              Art Collections
            </h1>
          </div>
        </div>
        {/* Navigation Arrow for Exhibit Section */}
        <div className="absolute bottom-10 w-full flex justify-center">
          <button onClick={scrollToExhibit} className="animate-bounce">
            <FaChevronDown className="text-white" size={40} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto py-12 px-6">
        {/* Note regarding museum-only artworks */}
        <p className="mb-6 text-center text-sm text-gray-600 italic">
          Note: Some artworks are only viewable in the actual museum.
        </p>

        {groupedArts.map((group, index) => (
          <div key={index} className="mb-12">
            <button
              className="w-full text-white text-center text-2xl font-semibold p-4 bg-yellow-800 rounded-lg hover:bg-yellow-900 transition"
              onClick={() => toggleGroup(index)}
            >
              <div className="flex flex-col items-center">
                <div>{group.title}</div>
                <div className="text-black italic text-base mt-1">
                  ({group.translation})
                </div>
              </div>
            </button>
            <hr className="border-gray-300 my-4" />
            {openGroups[index] && (
              <div className="mt-6 bg-white p-6 rounded-lg shadow-lg">
                <ArtCarousel arts={group.arts} />
              </div>
            )}
          </div>
        ))}

        <div className="mt-12 flex justify-center space-x-4">
          <button
            onClick={() => setQuizOpen(true)}
            className="px-6 py-3 bg-yellow-800 text-white font-bold rounded-lg hover:bg-yellow-900 transition"
          >
            Take Quiz
          </button>
          <button
            onClick={() => setPuzzleOpen(true)}
            className="px-6 py-3 bg-yellow-800 text-white font-bold rounded-lg hover:bg-yellow-900 transition"
          >
            Solve Puzzles
          </button>
        </div>
      </div>
      <hr></hr>
      <br /><br /><br />
      {/* Exhibit Section */}
      <div
        className="w-full"
        style={{
          backgroundImage: "url('/images/artsbg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <hr className="border-t border-gray-300" />
        <div ref={exhibitRef} className="max-w-full">
          <Exhibit />
        </div>
      </div>


      {/* Modal Popup for Quiz */}
      {quizOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg max-w-3xl w-[90%] sm:w-full relative h-[80vh] flex flex-col shadow-lg">
            <h2 className="text-3xl font-semibold mb-4 text-center text-black">
              Test Your Knowledge
            </h2>
            <div className="flex-1 overflow-y-auto px-4 space-y-6">
              <CustomQuiz
                onQuizEnd={(results) => {
                  console.log("Quiz Results:", results);
                }}
              />
            </div>
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setQuizOpen(false)}
                className="px-6 py-3 bg-white border border-[#8B4513] text-[#8B4513] font-bold rounded-lg hover:bg-[#F0E6D2] transition"
              >
                Close Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Popup for Puzzle */}
      {puzzleOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg max-w-3xl w-[90%] sm:w-full relative h-[80vh] flex flex-col shadow-lg">
            <h2 className="text-3xl font-semibold mb-4 text-center text-gray-800">
              Solve the Puzzle
            </h2>
            <div className="flex-1 overflow-y-auto px-4 space-y-6">
              <Puzzle />
            </div>
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setPuzzleOpen(false)}
                className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition"
              >
                Close Puzzle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupedArtsPage;

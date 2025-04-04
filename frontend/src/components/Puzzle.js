import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { v4 as uuidv4 } from "uuid";

// Define the images for the puzzle
const images = [
  "/images/puzzle1.jpg",
  "/images/puzzle2.jpg",
  "/images/puzzle3.jpg",
  "/images/puzzle4.jpg",
  "/images/puzzle5.jpg",
  "/images/puzzle6.jpg",
  "/images/puzzle7.jpg",
  "/images/puzzle8.jpg",
  "/images/puzzle9.jpg",
  "/images/puzzle10.jpg",
];

// Define the descriptions for each puzzle
const descriptions = [
  "Gen. Venancio Concepción: The military commander of northern Pampanga, was headquartered at the Pamintuan Residence until early May 1899, after which he transferred to Bamban, Tarlac.",
  "Gen. Gregorio H. del Pilar: The boy general arrived with Pres. Aguinaldo on May 7, 1899. He accompanied the president when he moved to Tarlac, Tarlac, which became capital of the Philippine Republic.",
  "Gen. Antonio Luna: Commander-in-Chief of the Philippine forces in Central Luzon, was the architect of the Caloocan Angeles Defense Line that created a series of delaying battles in order to buy time for the construction of a guerilla base in the Mountain Province, the last-stand headquarters of the First Philippine Republic.",
  "Capitan Juan Nepomuceno: Served as the only President Municipal of Angeles under the First Philippine Republic. He took office beginning in September 1898 for only a few months because the U.S. Military Government was established the following year.",
  "This is a reenactment of the ambuscades that the infidels ('Moors,' as the Christian Europeans called them to refer to Muslims) launched against the Crusaders as the latter returned to Europe from the Holy Land.",
  "MA. AGUSTINA HENSON de NEPOMUCENO: Ma. Agustina Henson was born in Cullat on August 28, 1828. She was the elder sister of Mariano Vicente who was also adopted by her uncle Don Ciriaco de Miranda. On November 26, 1847, the 19-year-old Agustina married the 30-year-old Don Plo Rafael Nepomceno y Villaseñor of Manila and Lucban, Tayabas (now Quezon Province).",
  "CIRIACO DE MIRANDA: Ciriaco de Miranda was born around 1794 in San Fernando. He was the second child of the founders Don Angel de Miranda and Doña Rosalia de Jesus. On April 16, 1818, he married Doña Carlota de Leon of Guagua. Don Ciriaco died on July 9, 1859 and Doña Carlota followed on June 29, 1869.",
  "DOÑA ROSALIA DE JESUS: Doña Rosalia was born on September 4, 1765, most probably in San Fernando. In 1796, she and her husband, Don Angel Pantaleon de Miranda, began clearing Culiat, the northernmost barrio of San Fernando. She was a model of charity, opening the first public dispensary in 1811 and later the first primary school. She died on December 9, 1840, at the age of 75 years.",
  "Our Mother and Queen of the Holy Rosary: Indu Mi as Reina na ning Sto. Rosario.",
  "DON ANGEL PANTALEON DE MIRANDA: Don Angel was born on July 27, 1765, most probably in the town of San Fernando. He served as the mayor of his hometown in 1795, and in 1796 he and his wife, Doña Rosalia de Jesus, began clearing Culiat, the town's northernmost barrio. His efforts led to the creation of Angeles on December 8, 1829. He died on June 21, 1835, at the age of 70 years."
];

const PuzzlePiece = ({
  id,
  index,
  emptyIndex,
  gridSize,
  src,
  pieceSize,
  onClick,
}) => {
  const row = Math.floor(id / gridSize);
  const col = id % gridSize;

  return (
    <div
      onClick={() => onClick(index)}
      className="border cursor-pointer flex items-center justify-center"
      style={{
        width: pieceSize,
        height: pieceSize,
        backgroundImage: id !== null ? `url(${src})` : "none",
        backgroundSize: `${gridSize * pieceSize}px ${gridSize * pieceSize}px`,
        backgroundPosition:
          id !== null ? `-${col * pieceSize}px -${row * pieceSize}px` : "none",
        backgroundColor: id === null ? "#8B5E3C" : "transparent", // Rustic brown for empty pieces
        borderColor: "#6E4B3A", // Dark brown border
      }}
    ></div>
  );
};

const PuzzleGame = ({ gridSize = 3 }) => {
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [scrambledPuzzles, setScrambledPuzzles] = useState([]);
  const [pieces, setPieces] = useState([]);
  const [emptyIndex, setEmptyIndex] = useState(gridSize * gridSize - 1);
  const [solved, setSolved] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [totalTime, setTotalTime] = useState(null);
  const pieceSize = 100;

  const getNeighbors = (index, gridSize) => {
    const neighbors = [];
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    if (row > 0) neighbors.push(index - gridSize); // up
    if (row < gridSize - 1) neighbors.push(index + gridSize); // down
    if (col > 0) neighbors.push(index - 1); // left
    if (col < gridSize - 1) neighbors.push(index + 1); // right
    return neighbors;
  };

  const scramblePuzzle = (moves = 100) => {
    let state = Array.from({ length: gridSize * gridSize }, (_, i) => i);
    state[state.length - 1] = null; // Empty space at the last index

    let empty = state.indexOf(null);

    for (let i = 0; i < moves; i++) {
      const neighbors = getNeighbors(empty, gridSize);
      const randNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
      [state[empty], state[randNeighbor]] = [state[randNeighbor], state[empty]];
      empty = randNeighbor;
    }

    return state;
  };

  const isSolved = (pieces) => {
    return pieces.every((val, index) => val === index || val === null);
  };

  useEffect(() => {
    const scrambled = images.map((image) => scramblePuzzle(100));
    setScrambledPuzzles(scrambled);
  }, []);

  useEffect(() => {
    if (!images[currentPuzzleIndex]) return;

    if (currentPuzzleIndex === 0) {
      setStartTime(Date.now());
    }

    const scrambledPieces = scrambledPuzzles[currentPuzzleIndex];

    if (scrambledPieces) {
      setPieces(scrambledPieces);
      setEmptyIndex(scrambledPieces.indexOf(null));
      setSolved(false);
    } else {
      console.error("Puzzle not loaded properly");
    }
  }, [currentPuzzleIndex, scrambledPuzzles]);

  const movePiece = (fromIndex, toIndex) => {
    setPieces((prevPieces) => {
      const newPieces = [...prevPieces];
      [newPieces[fromIndex], newPieces[toIndex]] = [
        newPieces[toIndex],
        newPieces[fromIndex],
      ];
      return newPieces;
    });
    setEmptyIndex(fromIndex);
  };

  useEffect(() => {
    if (isSolved(pieces)) {
      setSolved(true);
    }
  }, [pieces]);

  const handleNextPuzzle = () => {
    if (currentPuzzleIndex < images.length - 1) {
      setCurrentPuzzleIndex((prevIndex) => prevIndex + 1);
    } else {
      setTotalTime(((Date.now() - startTime) / 1000).toFixed(2));
    }
  };

  const handleClick = (index) => {
    const neighbors = getNeighbors(emptyIndex, gridSize);
    if (neighbors.includes(index)) {
      movePiece(index, emptyIndex);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {totalTime ? (
        <p className="text-[#6E4B3A] font-bold text-lg">
          You solved all puzzles in {totalTime} seconds! 🎉
        </p>
      ) : (
        <>
          {solved ? (
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="flex flex-col items-center"
            >
              <img
                src={images[currentPuzzleIndex]}
                alt="Solved Puzzle"
                className="rounded shadow-lg"
                style={{
                  width: `${gridSize * pieceSize}px`,
                  height: `${gridSize * pieceSize}px`,
                }}
              />
              <p className="text-[#6E4B3A] font-bold mt-2 text-lg">
                Puzzle Solved! 🎉
              </p>
              <p className="text-lg mt-2 text-center">{descriptions[currentPuzzleIndex]}</p>
              <button
                onClick={handleNextPuzzle}
                className="mt-4 bg-[#8B5E3C] text-white px-4 py-2 rounded hover:bg-[#6E4B3A]"
              >
                {currentPuzzleIndex < images.length - 1 ? "Solve Next" : "Finish"}
              </button>
            </motion.div>
          ) : (
            <div
              className="grid"
              style={{
                gridTemplateColumns: `repeat(${gridSize}, ${pieceSize}px)`,
                width: `${gridSize * pieceSize}px`,
                height: `${gridSize * pieceSize}px`,
              }}
            >
              {pieces.map((pieceIndex, i) => (
                <PuzzlePiece
                  key={uuidv4()}
                  id={pieceIndex}
                  index={i}
                  emptyIndex={emptyIndex}
                  gridSize={gridSize}
                  src={images[currentPuzzleIndex]}
                  pieceSize={pieceSize}
                  onClick={handleClick}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PuzzleGame;

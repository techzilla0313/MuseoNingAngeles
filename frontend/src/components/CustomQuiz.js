import React, { useState, useEffect } from 'react';

const CustomQuiz = ({ onQuizEnd }) => {
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
  const [results, setResults] = useState([]);
  const [isQuizFinished, setIsQuizFinished] = useState(false);

  // Fetch quiz data when component mounts
  useEffect(() => {
    fetch('https://api.museoningangeles.com/api/quiz')
      .then(response => response.json())
      .then(data => setQuiz(data))
      .catch(error => console.error('Error fetching quiz data:', error));
  }, []);

  // Display a loading message while the quiz is being fetched
  if (!quiz) {
    return <div className="text-center mt-8">Loading quiz...</div>;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  const handleAnswerSelect = (index) => {
    setSelectedAnswerIndex(index);
  };

  const handleConfirmAnswer = () => {
    if (selectedAnswerIndex === null) return;

    const correctAnswerIndex = parseInt(currentQuestion.correctAnswer, 10) - 1;
    const isCorrect = selectedAnswerIndex === correctAnswerIndex;

    const newResult = {
      question: currentQuestion.question,
      selectedAnswer: currentQuestion.answers[selectedAnswerIndex],
      isCorrect,
      correctAnswer: currentQuestion.answers[correctAnswerIndex],
      point: currentQuestion.point,
      messageForCorrectAnswer: currentQuestion.messageForCorrectAnswer,
      messageForIncorrectAnswer: currentQuestion.messageForIncorrectAnswer,
    };

    const updatedResults = [...results, newResult];
    setResults(updatedResults);
    setSelectedAnswerIndex(null);

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsQuizFinished(true);
      onQuizEnd(updatedResults);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswerIndex(null);
    setResults([]);
    setIsQuizFinished(false);
  };

  if (isQuizFinished) {
    const score = results.filter(result => result.isCorrect).length;
    return (
      <div className="quiz-results-container text-center p-4">
        <h3 className="text-2xl font-bold text-black mb-4">Quiz Completed!</h3>
        <p className="text-xl text-black mb-6">
          You scored {score} out of {quiz.questions.length}
        </p>
        <div className="space-y-4">
          {results.map((result, index) => (
            <div key={index} className="p-4 border rounded-lg border-[#8B4513] bg-white">
              <p className="font-semibold text-black">{result.question}</p>
              <p className="mt-2 text-black">
                Your answer: <span className="font-bold">{result.selectedAnswer}</span>
              </p>
              <p className="mt-1">
                {result.isCorrect ? (
                  <span className="text-green-600 font-bold">{result.messageForCorrectAnswer}</span>
                ) : (
                  <span className="text-red-600 font-bold">{result.messageForIncorrectAnswer}</span>
                )}
              </p>
            </div>
          ))}
        </div>
        <button
          onClick={handleRestartQuiz}
          className="mt-6 w-full px-6 py-3 bg-[#8B4513] text-white font-bold rounded-lg hover:bg-[#A0522D] transition"
        >
          Restart Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-container p-4">
      <h3 className="text-xl font-semibold text-black mb-4">
        {currentQuestion.question}
      </h3>
      <div className="mt-4 space-y-2">
        {currentQuestion.answers.map((answer, index) => (
          <button
            key={index}
            onClick={() => handleAnswerSelect(index)}
            className={`block w-full p-3 rounded-lg border-2 ${
              selectedAnswerIndex === index
                ? 'bg-[#8B4513] text-white border-[#8B4513]'
                : 'bg-white text-black border-black hover:bg-[#8B4513] hover:text-white hover:border-[#8B4513]'
            }`}
          >
            {answer}
          </button>
        ))}
      </div>
      {selectedAnswerIndex !== null && (
        <button
          onClick={handleConfirmAnswer}
          className="mt-4 w-1/3 px-6 py-3 border border-solid text-black rounded-lg hover:bg-[#8B4513] hover:text-white transition mx-auto"
        >
          Next
        </button>
      )}
    </div>
  );
};

export default CustomQuiz;

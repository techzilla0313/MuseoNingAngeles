import React, { useState, useEffect } from 'react';

const ManageQuiz = () => {
  const [questions, setQuestions] = useState([]);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    question: '',
    questionType: 'text',
    answers: '', // Use a comma-separated string for simplicity
    correctAnswer: '',
    messageForCorrect: '',
    messageForIncorrect: '',
    point: 10,
  });

  // Fetch quiz questions from the backend
  const fetchQuestions = () => {
    fetch('https://api.museoningangeles.com/api/quiz')
      .then(response => response.json())
      .then(data => {
        // 'data.questions' contains our questions array
        setQuestions(data.questions);
      })
      .catch(error => console.error('Error fetching quiz data:', error));
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Update form state on input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Reset form data to initial state
  const resetForm = () => {
    setFormData({
      question: '',
      questionType: 'text',
      answers: '',
      correctAnswer: '',
      messageForCorrect: '',
      messageForIncorrect: '',
      point: 10,
    });
  };

  // Handle form submission for adding or updating a question
  const handleSubmit = (e) => {
    e.preventDefault();

    // Convert comma-separated answers into a JSON string
    const answersArray = formData.answers.split(',').map(ans => ans.trim());
    const payload = {
      question: formData.question,
      question_type: formData.questionType,
      answers: JSON.stringify(answersArray),
      correct_answer: formData.correctAnswer,
      message_for_correct: formData.messageForCorrect,
      message_for_incorrect: formData.messageForIncorrect,
      point: formData.point,
    };

    if (editingQuestion) {
      // Update existing question (PUT)
      fetch(`https://api.museoningangeles.com/api/quiz/${editingQuestion.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(response => response.json())
        .then(data => {
          fetchQuestions();
          setEditingQuestion(null);
          resetForm();
          setIsModalOpen(false);
        })
        .catch(error => console.error('Error updating question:', error));
    } else {
      // Add new question (POST)
      fetch('https://api.museoningangeles.com/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(response => response.json())
        .then(data => {
          fetchQuestions();
          resetForm();
          setIsModalOpen(false);
        })
        .catch(error => console.error('Error adding question:', error));
    }
  };

  // Populate the form for editing and open the modal
  const handleEdit = (question) => {
    setEditingQuestion(question);
    setFormData({
      question: question.question,
      questionType: question.questionType,
      answers: question.answers.join(', '), // Join answers array into a comma-separated string
      correctAnswer: question.correctAnswer,
      messageForCorrect: question.messageForCorrectAnswer,
      messageForIncorrect: question.messageForIncorrectAnswer,
      point: question.point,
    });
    setIsModalOpen(true);
  };

  // Delete a question
  const handleDelete = (id) => {
    fetch(`https://api.museoningangeles.com/api/quiz/${id}`, {
      method: 'DELETE'
    })
      .then(response => response.json())
      .then(data => fetchQuestions())
      .catch(error => console.error('Error deleting question:', error));
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Manage Quiz Questions</h2>
      
      {/* List of existing questions */}
      <div>
        <h3 className="text-xl font-semibold mb-2">Existing Questions</h3>
        <div className="space-y-4">
          {questions.map(q => (
            <div key={q.id} className="p-4 border rounded flex justify-between items-center">
              <div>
                <p className="font-bold">{q.question}</p>
                <p className="text-sm text-gray-600">
                  Answers: {q.answers.join(', ')}
                </p>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleEdit(q)} 
                  className="px-3 py-1 bg-blue-500 text-white rounded"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(q.id)} 
                  className="px-3 py-1 bg-red-500 text-white rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Button to open modal for adding a new question */}
      <div className="mt-6">
        <button 
          onClick={() => { setIsModalOpen(true); setEditingQuestion(null); resetForm(); }} 
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
        >
          Add Question
        </button>
      </div>

      {/* Modal for the form */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">
              {editingQuestion ? 'Edit Question' : 'Add Question'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-medium">Question</label>
                <input 
                  type="text"
                  name="question"
                  value={formData.question}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block font-medium">Question Type</label>
                <select 
                  name="questionType" 
                  value={formData.questionType} 
                  onChange={handleChange} 
                  className="w-full border p-2 rounded"
                >
                  <option value="text">Text</option>
                  {/* Extend this list if you support other types */}
                </select>
              </div>
              <div>
                <label className="block font-medium">Answers (comma separated)</label>
                <input 
                  type="text"
                  name="answers"
                  value={formData.answers}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block font-medium">
                  Correct Answer (enter index as a string e.g. "1")
                </label>
                <input 
                  type="text"
                  name="correctAnswer"
                  value={formData.correctAnswer}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block font-medium">Message for Correct Answer</label>
                <input 
                  type="text"
                  name="messageForCorrect"
                  value={formData.messageForCorrect}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block font-medium">Message for Incorrect Answer</label>
                <input 
                  type="text"
                  name="messageForIncorrect"
                  value={formData.messageForIncorrect}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block font-medium">Point</label>
                <input 
                  type="number"
                  name="point"
                  value={formData.point}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button type="submit" className="px-4 py-2 bg-[#8B4513] text-white rounded">
                  {editingQuestion ? 'Update Question' : 'Add Question'}
                </button>
                <button 
                  type="button" 
                  onClick={() => { setIsModalOpen(false); setEditingQuestion(null); resetForm(); }}
                  className="px-4 py-2 bg-gray-300 text-black rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageQuiz;

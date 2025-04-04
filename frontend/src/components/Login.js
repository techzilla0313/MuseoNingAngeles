import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import frontbg from '../images/frontbg.jpg'; // Import the frontbg image

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // State to hold success message
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
  
    if (!username || !password) {
      setErrorMessage('Please enter both username and password.');
      return;
    }
  
    try {
      const response = await fetch('https://api.museoningangeles.com/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // Save both token and user data in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setSuccessMessage('Login successful! Redirecting...');
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        setErrorMessage(data.error || 'An error occurred during login');
      }
    } catch (error) {
      setErrorMessage('Failed to connect to the server');
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: `url(${frontbg})` }}
    >
      <div className="absolute top-4 left-4">
        <button
          onClick={() => navigate('/')} // Navigate to home page
          className="text-gray-400 font-bold font-serif text-lg bg-transparent border-none p-0 hover:text-gray-600"
        >
          Home
        </button>
      </div>

      <div className="bg-white p-8 rounded shadow-lg w-96 bg-opacity-80">
        <h2 className="text-2xl font-semibold mb-4">Login</h2>
        
        {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>} {/* Success message */}
        {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>} {/* Error message */}
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block mb-2 text-sm">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-2 text-gray-600"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
          >
            Login
          </button>
        </form>

        <div className="mt-4 text-sm text-center">
          <p>
            Don't have an account?{' '}
            <a
              href="/register"
              className="text-indigo-600 hover:text-indigo-800"
            >
              Register here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

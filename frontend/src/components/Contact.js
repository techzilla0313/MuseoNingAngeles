import React, { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Your message has been sent!');
    // Add logic to handle form submission (e.g., sending data to a backend)
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-10">
  <div className="w-96 bg-white p-8 rounded-lg shadow-lg">
    <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
      Contact Us
    </h1>
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="name" className="block text-lg font-semibold text-gray-700">
          Full Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Your full name"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="email" className="block text-lg font-semibold text-gray-700">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Your email address"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="message" className="block text-lg font-semibold text-gray-700">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows="5"
          placeholder="Your message"
        ></textarea>
      </div>

      <button
        type="submit"
        className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        Send Message
      </button>
    </form>
  </div>
</div>


  );
};

export default Contact;

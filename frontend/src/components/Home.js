import React, { useState, useEffect } from "react";
import museum1 from "../images/museum1.jpg";
import museum2 from "../images/museum2.jpg";
import museum3 from "../images/museum3.jpg";
import museum4 from "../images/museum4.jpg";
import museum5 from "../images/museum5.jpg";
import museum6 from "../images/museum6.jpg";
import pisambanmaragul from "../images/pisambanmaragul.jpg";
import resident from "../images/resident.jpg";
import mansion from "../images/mansion.jpg";
import { useNavigate } from "react-router-dom";
import { FaChevronDown } from "react-icons/fa"; // Import arrow icon
import emailjs from 'emailjs-com';
import Swal from "sweetalert2";


export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    date: "",
    time: "",
    contact: "",
    person: "",
    message: "",
  });
  const navigate = useNavigate();


  const images = [
    "/images/carousel8.jpg",
    "/images/carousel2.jpg",
    "/images/carousel3.jpg",
    "/images/carousel4.jpg",
    "/images/carousel5.jpg",
    "/images/carousel6.jpg",
    "/images/carousel7.jpg",
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      fetchUserData(token);
    }

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2500); 

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  const fetchUserData = async (token) => {
    try {
      const response = await fetch("https://api.museoningangeles.com/api/user-details", { // Ensure full URL
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
  
      const user = await response.json();
      console.log("Fetched User Data:", user);
  
      setFormData({
        name: user.name || "",
        email: user.email || "",
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };
  

  const handleVirtualTourClick = () => {
  };


  const handleRedirect = (page) => {
    setShowModal(false);
    navigate(`/${page}`);
  };

  // Function to scroll to the next section
  const scrollToSection = () => {
    const section = document.getElementById("museum-description");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Function to send email
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      // Send email with emailjs
      const emailResponse = await emailjs.send(
        "service_16gn1cs", 
        "template_tffyu9i", 
        formData,
        "_CeoyOvZRnZNP3OKZ" 
      );
      console.log("Email sent successfully:", emailResponse);
  
      // Log the form data before sending it to the API
      console.log("Sending formData:", formData);
  
      // Now, save the appointment to the database
      const response = await fetch("https://api.museoningangeles.com/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      console.log("API response status:", response.status);
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error("Failed to save appointment");
      }
  
      const result = await response.json();
      console.log("Appointment saved:", result);
  
      Swal.fire({
        title: "Appointment Booked!",
        text: "You have successfully booked an appointment. The museum will contact you if your appointment is confirmed.\nThank you!",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        window.location.reload();
      });
  
      setShowForm(false);
      setFormData({
        name: userData?.name || "",
        email: userData?.email || "",
        date: "",
        time: "",
        contact: "",
        person: "",
        message: "",
      });
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      alert("Failed to send appointment request.");
    }
  };
  

  const image = [pisambanmaragul, mansion, resident];
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    // Move to previous image, looping to the end if needed
    setCurrentIndex((prevIndex) => (prevIndex - 1 + image.length) % image.length);
  };

  const handleNext = () => {
    // Move to next image, looping to the start if needed
    setCurrentIndex((prevIndex) => (prevIndex + 1) % image.length);
  };

  return (
    <div className="min-h-screen overflow-y-auto">
      <div
        className="relative w-full h-[60vh] md:h-[93vh] bg-cover bg-center transition-all duration-1000 bg-scroll md:bg-fixed"
        style={{
          backgroundImage: `url(${images[currentImageIndex]})`,
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white text-center px-4 space-y-4">
          <h1 className="font-serif leading-tight text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
            <span className="block">Welcome to</span>
            <span className="block">Museo ning Angeles</span>
          </h1>
          <button
            onClick={handleVirtualTourClick}
            className="px-4 py-2 sm:px-6 sm:py-3 bg-yellow-800 hover:bg-yellow-900 rounded-lg text-base sm:text-md md:text-lg font-semibold shadow-md transition duration-300"
          >
            <a
              href="https://my.matterport.com/show/?m=VgkZ58DrAY9"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white"
            >
              Virtual Tour
            </a>
          </button>
        </div>

        {/* Responsive Scroll Down Arrow */}
        <button
          onClick={scrollToSection}
          className="absolute bottom-8 md:bottom-10 left-1/2 transform -translate-x-1/2 text-white text-2xl md:text-3xl animate-bounce"
        >
          <FaChevronDown />
        </button>
      </div>


      {/* Museum Description */}
      <div id="museum-description" className="bg-white text-gray-900 py-20 px-6 text-center">
        <h2 className="text-4xl font-serif font-bold mb-6">Malaus ko pu!</h2>
        <p className="max-w-6xl font-serif mx-auto text-lg leading-relaxed">
          Museo ning Angeles (MnA) is the nucleus of activity of the Kuliat Foundation, Inc. 
          Located in the oldest historical district of the city, the MnA has become the venue 
          of the city’s cultural activities, be it from the private or government sector. 
          Since opening in 1999, it has been a hub for exhibits, art classes, concerts, performances, 
          and traditional celebrations.
        </p>
      </div>

      <hr></hr>

      {/* Location Section */}
      <div className="bg-white py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          
          {/* Left: Location */}
          <div className="w-full h-64 md:h-80 rounded-lg overflow-hidden shadow-md">
            <iframe
              title="Museo ning Angeles Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30880.21852936164!2d120.5684221!3d15.1347433!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3396f24f4ba14ca1%3A0x1179dcd197a42200!2sMuseu%20ning%20%C3%81ngeles!5e0!3m2!1sen!2sph!4v1707321260000"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>

          {/* Middle: Image */}
          <div className="relative flex justify-center items-center">
            {/* Left arrow button */}
            <button
              onClick={handlePrev}
              className="absolute left-0 bg-gray-300 bg-opacity-50 p-2 rounded-full hover:bg-gray-400 focus:outline-none"
            >
              {/* Left arrow icon (using inline SVG) */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-black"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Image display */}
            <img
              src={image[currentIndex]}
              alt="Museo ning Angeles"
              className="w-full max-w-sm h-80 object-cover rounded-lg shadow-2xl"
            />

            {/* Right arrow button */}
            <button
              onClick={handleNext}
              className="absolute right-0 bg-gray-300 bg-opacity-50 p-2 rounded-full hover:bg-gray-400 focus:outline-none"
            >
              {/* Right arrow icon (using inline SVG) */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-black"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Right: Description */}
          <div className="text-center md:text-left">
            <p className="text-lg font-serif text-justify text-gray-700 leading-relaxed">
              MNA is located in Old Municipal Bldg., Heritage District, 
              Santo Rosario St, Angeles City, 2009 Pampanga.
            </p>
            <p className="text-lg font-serif text-justify text-gray-700 mt-8 leading-relaxed">
              The museum is surrounded by many historical landmarks significant to 
              Angeles City’s history and heritage, such as the Holy Rosary Parish Church, 
              Pamintuan Mansion, and Residencia de Don Angel Pantaleon De Miranda (Founder’s House).
            </p>
          </div>
        </div>
      </div>   
      <div
        className="py-16 w-full bg-yellow-900 bg-opacity-50"
      >
        {/* Title and Image Gallery in the same div with white bg and opacity */}
        <div className="w-full">
          {/* Title */}
          <h2 className="text-4xl font-serif font-semibold text-center mb-12 text-black">Museo ning Angeles</h2>

          {/* Image Gallery */}
          <div className=" border-white p-6 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mx-auto max-w-6xl">
              {[museum2, museum1, museum5, museum3, museum4, museum6].map((image, index) => (
                <div
                  key={index}
                  className="relative p-2 transition-transform transform hover:scale-105 hover:-translate-y-2 hover:z-10"
                >
                  <img
                    src={image}
                    alt={`Museum ${index + 1}`}
                    className="w-full h-64 object-cover rounded-lg shadow-xl"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white py-12 sm:py-16 px-4 sm:px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-6">
          Hours & Appointments
        </h2>
        <p className="text-lg sm:text-xl font-bold font-serif text-gray-800">
          Museo Ning Angeles is open daily (except holidays)
        </p>
        <p className="text-lg sm:text-xl font-bold text-gray-900 my-3">9:00 AM to 5:00 PM</p>
        <p className="text-lg sm:text-xl font-serif text-gray-800">Admission is Free</p>

        <div className="mt-6">
          <p className="text-lg sm:text-xl font-serif text-gray-800">Call to book an appointment:</p>
          <p className="text-lg sm:text-xl font-bold text-gray-900">(+63) 939 268 3391</p>
          <p className="text-lg sm:text-xl font-serif text-gray-800">or</p>
        </div>

        {/* Book an Appointment Button */}
        <div className="mt-4">
          <button
            onClick={() => {
              if (!isLoggedIn) {
                // If not logged in, show the modal or redirect to login
                setShowModal(true);
              } else {
                setShowForm(true);
              }
            }}
            className="inline-block bg-yellow-800 text-white text-base sm:text-lg font-serif px-4 sm:px-5 py-2 rounded-lg transition duration-300 hover:bg-yellow-900"
          >
            Book an Appointment
          </button>
        </div>

        <p className="mt-6 text-lg sm:text-xl font-serif font-bold text-gray-800">
          We're looking forward to your visit!
        </p>

        {/* Appointment Form Modal */}
        {showForm && (
          <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50 p-4">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md overflow-y-auto">
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mb-4">
                Book an Appointment
              </h3>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full p-2 mb-3 border border-gray-300 rounded-lg text-base"
                  required
                  readOnly
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full p-2 mb-3 border border-gray-300 rounded-lg text-base"
                  required
                  readOnly
                />
                <input
                  type="date"
                  name="date"
                  placeholder="Date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full p-2 mb-3 border border-gray-300 rounded-lg text-base"
                  required
                />
                <input
                  type="time"
                  name="time"
                  placeholder="Time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full p-2 mb-3 border border-gray-300 rounded-lg text-base"
                  required
                />
                <input
                  type="contact"
                  name="contact"
                  placeholder="Contact"
                  value={formData.contact}
                  onChange={handleChange}
                  className="w-full p-2 mb-3 border border-gray-300 rounded-lg text-base"
                  maxLength="11"
                  pattern="\d{11}"
                  inputMode="numeric"
                  required
                />
                <input
                  type="person"
                  name="person"
                  placeholder="How many person?"
                  value={formData.person}
                  onChange={handleChange}
                  className="w-full p-2 mb-3 border border-gray-300 rounded-lg text-base"
                  required
                />
                <textarea
                  name="message"
                  placeholder="(Optional)"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full p-2 mb-3 border border-gray-300 rounded-lg text-base"
                ></textarea>
                <div className="flex flex-col sm:flex-row justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="w-full sm:w-auto px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
                  >
                    Send Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>


      {/* Modal */}
      {showModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-80 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">You need to log in first</h2>
            <button
              onClick={() => setShowModal(false)} // Close the modal when clicked
              className="text-gray-600 hover:text-gray-800 focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlnsXlink="http://www.w3.org/1999/xlink"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <p className="text-gray-600">Log in to access this feature.</p>
          <div className="flex justify-between">
            <button
              onClick={() => handleRedirect("login")}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Login
            </button>
            <button
              onClick={() => handleRedirect("register")}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import ManageExhibit from "../manage/manageExhibit";
import ManageUsers from "../manage/manageUsers";
import Feedback from "./Feedback";
import ManageBooking from "../manage/manageBooking";
import ManageAnnouncement from "../manage/manageAnnouncement";
import ManageArts from "../manage/manageArts";
import ManageQuiz from "../manage/manageQuiz";
import ManageAnalytics from "../manage/manageAnalytics";

const AdminPanel = () => {
  // State to store the user's role decoded from the token
  const [userRole, setUserRole] = useState("user");
  const [activeSection, setActiveSection] = useState("feedbacks");

  // Decode token and set the user role on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        console.log("Decoded token:", decodedToken); // Debug: check decoded token
        if (decodedToken.role) {
          setUserRole(decodedToken.role);
          // If the user is super_admin, default to "users" section; otherwise, default to "feedbacks"
          setActiveSection(decodedToken.role === "super_admin" ? "users" : "feedbacks");
        }
      } catch (err) {
        console.error("Error decoding token:", err);
        setUserRole("user");
      }
    }
  }, []);

  // Update activeSection and store it in localStorage when changed
  const handleSectionChange = (section) => {
    setActiveSection(section);
    localStorage.setItem("activeSection", section);
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-64 bg-yellow-700 text-white min-h-screen p-4">
        <h2 className="text-2xl font-semibold mb-6">Admin Panel</h2>
        <ul className="space-y-4">
          {/* Only show the Users menu if the role is super_admin */}
          {userRole === "super_admin" && (
            <li>
              <button
                onClick={() => handleSectionChange("users")}
                className={`w-full text-left p-2 rounded hover:bg-yellow-800 ${
                  activeSection === "users" ? "bg-yellow-900" : ""
                }`}
              >
                Users
              </button>
            </li>
          )}
          <li>
            <button
              onClick={() => handleSectionChange("feedbacks")}
              className={`w-full text-left p-2 rounded hover:bg-yellow-800 ${
                activeSection === "feedbacks" ? "bg-yellow-900" : ""
              }`}
            >
              Feedbacks
            </button>
          </li>
          <li>
            <button
              onClick={() => handleSectionChange("exhibits")}
              className={`w-full text-left p-2 rounded hover:bg-yellow-800 ${
                activeSection === "exhibits" ? "bg-yellow-900" : ""
              }`}
            >
              Exhibits
            </button>
          </li>
          <li>
            <button
              onClick={() => handleSectionChange("appointments")}
              className={`w-full text-left p-2 rounded hover:bg-yellow-800 ${
                activeSection === "appointments" ? "bg-yellow-900" : ""
              }`}
            >
              Appointments
            </button>
          </li>
          <li>
            <button
              onClick={() => handleSectionChange("announcements")}
              className={`w-full text-left p-2 rounded hover:bg-yellow-800 ${
                activeSection === "announcements" ? "bg-yellow-900" : ""
              }`}
            >
              Announcements
            </button>
          </li>
          <li>
            <button
              onClick={() => handleSectionChange("arts")}
              className={`w-full text-left p-2 rounded hover:bg-yellow-800 ${
                activeSection === "arts" ? "bg-yellow-900" : ""
              }`}
            >
              Arts
            </button>
          </li>
          <li>
            <button
              onClick={() => handleSectionChange("quiz")}
              className={`w-full text-left p-2 rounded hover:bg-yellow-800 ${
                activeSection === "quiz" ? "bg-yellow-900" : ""
              }`}
            >
              Quiz
            </button>
          </li>
          <li>
            <button
              onClick={() => handleSectionChange("analytics")}
              className={`w-full text-left p-2 rounded hover:bg-yellow-800 ${
                activeSection === "analytics" ? "bg-yellow-900" : ""
              }`}
            >
              Visitor Logs
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Render Users section only if the active section is 'users' and the user is super_admin */}
        {activeSection === "users" && (
          <div>
            {userRole === "super_admin" ? (
              <ManageUsers />
            ) : (
              <p className="text-red-500">
                Unauthorized: Only super_admins can view the Users section.
              </p>
            )}
          </div>
        )}

        {activeSection === "feedbacks" && <Feedback />}
        {activeSection === "exhibits" && <ManageExhibit />}
        {activeSection === "appointments" && <ManageBooking />}
        {activeSection === "announcements" && <ManageAnnouncement />}
        {activeSection === "arts" && <ManageArts />}
        {activeSection === "quiz" && <ManageQuiz />}
        {activeSection === "analytics" && <ManageAnalytics />}
      </div>
    </div>
  );
};

export default AdminPanel;

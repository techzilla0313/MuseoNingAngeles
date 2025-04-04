import React, { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";

const ManageBooking = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    date: "",
    time: "",
    contact: "",
    person: "",
    message: ""
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(appointments.length / itemsPerPage);
  const currentAppointments = appointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch("https://api.museoningangeles.com/api/appointments");
      if (!response.ok) {
        throw new Error("Failed to fetch appointments");
      }
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting an appointment
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appointment?")) {
      return;
    }
    try {
      const response = await fetch(`https://api.museoningangeles.com/api/appointments/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) {
        throw new Error("Failed to delete appointment");
      }
      setAppointments(appointments.filter((appointment) => appointment.id !== id));
    } catch (error) {
      console.error("Error deleting appointment:", error);
      alert("Failed to delete appointment.");
    }
  };

  const formatDateForInput = (dateStr) => {
    const date = new Date(dateStr);
    const tzOffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
    return new Date(date.getTime() - tzOffset).toISOString().split("T")[0];
  };

  const handleEditClick = (appointment) => {
    const formattedDate = formatDateForInput(appointment.date);

    setEditingAppointment(appointment);
    setEditFormData({
      name: appointment.name,
      email: appointment.email,
      date: formattedDate,
      time: appointment.time,
      contact: appointment.contact,
      person: appointment.person,
      message: appointment.message || ""
    });
  };

  // Update the form state as the user edits fields
  const handleEditFormChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };

  // Submit the updated appointment to the backend
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://api.museoningangeles.com/api/appointments/${editingAppointment.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(editFormData)
      });
      if (!response.ok) {
        throw new Error("Failed to update appointment");
      }
      const updatedAppointment = await response.json();
      setAppointments(
        appointments.map((appointment) =>
          appointment.id === updatedAppointment.id ? updatedAppointment : appointment
        )
      );
      setEditingAppointment(null);
    } catch (error) {
      console.error("Error updating appointment:", error);
      alert("Failed to update appointment.");
    }
  };

  // Cancel edit handler
  const handleCancelEdit = () => {
    setEditingAppointment(null);
    setEditFormData({
      name: "",
      email: "",
      date: "",
      time: "",
      contact: "",
      person: "",
      message: ""
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center py-4">
        <CircularProgress />
      </div>
    );

  return (
    <div className="p-4 w-full mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Appointment List</h2>

      {/* Editing Form */}
      {editingAppointment && (
        <form
          onSubmit={handleEditSubmit}
          className="bg-white shadow rounded-lg p-6 mb-8 max-w-xl mx-auto"
        >
          <h3 className="text-xl font-semibold mb-4">Edit Appointment</h3>
          <div className="mb-4">
            <label className="block font-medium mb-1">Name:</label>
            <input
              type="text"
              name="name"
              value={editFormData.name}
              readOnly
              className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1">Email:</label>
            <input
              type="email"
              name="email"
              value={editFormData.email}
              readOnly
              className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Date:</label>
              <input
                type="date"
                name="date"
                value={editFormData.date}
                onChange={handleEditFormChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Time:</label>
              <input
                type="time"
                name="time"
                value={editFormData.time}
                onChange={handleEditFormChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1">Contact:</label>
            <input
              type="text"
              name="contact"
              value={editFormData.contact}
              onChange={handleEditFormChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1">Number of Persons:</label>
            <input
              type="number"
              name="person"
              value={editFormData.person}
              onChange={handleEditFormChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1">Message:</label>
            <textarea
              name="message"
              value={editFormData.message}
              onChange={handleEditFormChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              rows="3"
            ></textarea>
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
            >
              Save
            </button>
          </div>
        </form>
      )}

      {/* Appointments Table */}
      {appointments.length === 0 ? (
        <p className="text-center">No appointments found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white divide-y divide-gray-200 shadow rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Persons</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Message</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booked At</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentAppointments.map((appt) => (
                <tr key={appt.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appt.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appt.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(appt.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appt.time}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appt.contact}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appt.person}</td>
                  <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">{appt.message}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(appt.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <button
                      onClick={() => handleEditClick(appt)}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(appt.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded ml-2"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {appointments.length > itemsPerPage && (
        <div className="flex justify-center items-center space-x-2 mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded ${
              currentPage === 1
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-yellow-600 text-white hover:bg-yellow-700"
            }`}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 rounded ${
                page === currentPage
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded ${
              currentPage === totalPages
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-yellow-600 text-white hover:bg-yellow-700"
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ManageBooking;

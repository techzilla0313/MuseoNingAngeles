import React, { useState, useEffect } from "react";
import {
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

const ManageAnnouncement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  // Include event_date in formData
  const [formData, setFormData] = useState({ title: "", content: "", event_date: "" });
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal state
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch("https://api.museoningangeles.com/api/announcements");
      if (!response.ok) {
        throw new Error("Failed to fetch announcements");
      }
      const data = await response.json();
      setAnnouncements(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content || !formData.event_date) {
      setMessage("Title, content, and event date are required.");
      return;
    }
    setIsSubmitting(true);
    const fd = new FormData();
    fd.append("title", formData.title);
    fd.append("content", formData.content);
    fd.append("event_date", formData.event_date);
    if (image) {
      fd.append("image", image);
    }
    try {
      const method = editingAnnouncement ? "PUT" : "POST";
      const url = editingAnnouncement
        ? `https://api.museoningangeles.com/api/announcements/${editingAnnouncement.id}`
        : "https://api.museoningangeles.com/api/announcements";
      const response = await fetch(url, { method, body: fd });
      const result = await response.json();
      if (response.ok) {
        setMessage(result.message);
        fetchAnnouncements();
        handleCancelEdit();
        setOpenModal(false);
      } else {
        setMessage(result.error);
      }
    } catch (err) {
      setMessage("Error saving announcement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (ann) => {
    setEditingAnnouncement(ann);
    setFormData({
      title: ann.title,
      content: ann.content,
      event_date: ann.event_date, // Prepopulate with the saved event_date
    });
    setImage(null);
    setMessage("");
    setOpenModal(true);
  };

  const handleCancelEdit = () => {
    setEditingAnnouncement(null);
    setFormData({ title: "", content: "", event_date: "" });
    setImage(null);
    setMessage("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    try {
      const response = await fetch(`https://api.museoningangeles.com/api/announcements/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (response.ok) {
        setMessage(result.message);
        fetchAnnouncements();
      } else {
        setMessage(result.error);
      }
    } catch (err) {
      setMessage("Error deleting announcement.");
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(announcements.length / itemsPerPage);
  const currentAnnouncements = announcements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Helper to shorten long text for display
  const shortenText = (text, maxLength = 100) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  };

  // Open modal for adding a new announcement
  const handleOpenModalForAdd = () => {
    handleCancelEdit();
    setOpenModal(true);
  };

  // Close modal
  const handleCloseModal = () => {
    handleCancelEdit();
    setOpenModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
        Manage Announcements
      </h1>

      {/* Announcement List */}
      {loading ? (
        <p className="text-center text-lg text-gray-600">Loading announcements...</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : announcements.length === 0 ? (
        <p className="text-center text-gray-600">No announcements found.</p>
      ) : (
        <>
          <h2 className="text-2xl font-bold mt-8 mb-4">Announcement List</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Content
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Date
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentAnnouncements.map((ann) => (
                  <tr key={ann.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ann.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-normal break-words">
                      {shortenText(ann.content)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ann.event_date ? new Date(ann.event_date).toLocaleDateString() : ""}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        onClick={() => handleEditClick(ann)}
                        className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(ann.id)}
                        className="ml-2 px-3 py-1 bg-red-700 text-white rounded hover:bg-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
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
        </>
      )}

      <div className="flex justify-center mt-6">
        <button
          onClick={handleOpenModalForAdd}
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
        >
          Add New Announcement
        </button>
      </div>

      {/* Modal Form */}
      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle>
          {editingAnnouncement ? "Edit Announcement" : "Add Announcement"}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            {message && <p className="mb-4 text-green-600">{message}</p>}
            <div className="mb-4">
              <label className="block mb-1 font-medium text-gray-800">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                placeholder="Enter announcement title"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium text-gray-800">
                Content
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleFormChange}
                rows="4"
                placeholder="Enter announcement content"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
                required
              ></textarea>
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium text-gray-800">
                Event Date
              </label>
              <input
                type="date"
                name="event_date"
                value={formData.event_date}
                onChange={handleFormChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium text-gray-800">
                Image
              </label>
              <input
                type="file"
                onChange={(e) => setImage(e.target.files[0])}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} color="secondary">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} color="primary">
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : editingAnnouncement ? (
                "Update Announcement"
              ) : (
                "Add Announcement"
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
};

export default ManageAnnouncement;

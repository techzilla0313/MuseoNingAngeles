import React, { useEffect, useState } from "react";
import {
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

const ManageExhibit = () => {
  const [exhibits, setExhibits] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [date, setDate] = useState("");
  const [editingExhibit, setEditingExhibit] = useState(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(exhibits.length / itemsPerPage);
  const currentExhibits = exhibits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Modal state
  const [openModal, setOpenModal] = useState(false);

  const fetchExhibits = async () => {
    try {
      const response = await fetch("https://api.museoningangeles.com/api/exhibits");
      const data = await response.json();
      // Sort exhibits by created_at in descending order
      const sortedExhibits = data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setExhibits(sortedExhibits);
    } catch (error) {
      console.error("Error fetching exhibits:", error);
    }
  };

  useEffect(() => {
    fetchExhibits();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!name) newErrors.name = "Name is required";
    if (!description) newErrors.description = "Description is required";
    // Require image only if adding a new exhibit
    if (!image && !editingExhibit) newErrors.image = "Image is required";
    if (!date) newErrors.date = "Date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    setIsLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("date", date);
    if (image) formData.append("image", image);

    try {
      const method = editingExhibit ? "PUT" : "POST";
      const url = editingExhibit
        ? `https://api.museoningangeles.com/api/exhibits/${editingExhibit.id}`
        : "https://api.museoningangeles.com/api/exhibits";

      const response = await fetch(url, {
        method,
        body: formData,
      });
      const result = await response.json();

      setMessage(
        result.message ||
          (editingExhibit
            ? "Exhibit updated successfully!"
            : "Exhibit added successfully!")
      );

      if (response.ok) {
        fetchExhibits();
        // Clear form fields after successful submission
        handleCancelEdit();
        setOpenModal(false);
      }
    } catch (error) {
      console.error("Error managing exhibit:", error);
      setMessage("Failed to save exhibit.");
    } finally {
      setIsLoading(false);
    }
  };

  // Open modal for editing an exhibit
  const handleEdit = (exhibit) => {
    setEditingExhibit(exhibit);
    setName(exhibit.name);
    setDescription(exhibit.description);
    setDate(exhibit.exhibit_date);
    setImage(null);
    setErrors({});
    setMessage("");
    setOpenModal(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`https://api.museoningangeles.com/api/exhibits/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      setMessage(result.message || "Exhibit deleted successfully!");
      fetchExhibits();
    } catch (error) {
      console.error("Error deleting exhibit:", error);
      setMessage("Failed to delete exhibit.");
    }
  };

  // Cancel edit or add form and close the modal
  const handleCancelEdit = () => {
    setEditingExhibit(null);
    setName("");
    setDescription("");
    setDate("");
    setImage(null);
    setErrors({});
    setMessage("");
  };

  const handleCloseModal = () => {
    handleCancelEdit();
    setOpenModal(false);
  };

  // Open modal for adding a new exhibit
  const handleOpenModalForAdd = () => {
    handleCancelEdit();
    setOpenModal(true);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Manage Exhibits</h1>

      {/* Exhibit List */}
      <h2 className="text-2xl font-bold mt-8 mb-4">Exhibit List</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentExhibits.map((exhibit) => (
              <tr key={exhibit.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {exhibit.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 whitespace-normal break-words">
                  {exhibit.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Intl.DateTimeFormat("en-US", {
                    month: "long",
                    day: "2-digit",
                    year: "numeric",
                  }).format(new Date(exhibit.exhibit_date))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <button
                    className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                    onClick={() => handleEdit(exhibit)}
                  >
                    Edit
                  </button>
                  <button
                    className="ml-2 px-3 py-1 bg-red-700 text-white rounded hover:bg-red-800"
                    onClick={() => handleDelete(exhibit.id)}
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

      {/* Modal Form Button */}
      <div className="flex justify-center mt-6">
        <button
          onClick={handleOpenModalForAdd}
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
        >
          Add New Exhibit
        </button>
      </div>

      {/* Modal Form */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingExhibit ? "Edit Exhibit" : "Add Exhibit"}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
                  rows="4"
                ></textarea>
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
                />
                {errors.date && (
                  <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Images
                </label>
                <input
                  type="file"
                  onChange={(e) => setImage(e.target.files[0])}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {errors.image && (
                  <p className="text-red-500 text-sm mt-1">{errors.image}</p>
                )}
              </div>
            </div>
            {message && (
              <p className="mt-4 text-center text-green-600 font-medium">
                {message}
              </p>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} color="secondary">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} color="primary">
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : editingExhibit ? (
                "Update Exhibit"
              ) : (
                "Add Exhibit"
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
};

export default ManageExhibit;

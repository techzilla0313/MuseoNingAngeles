import React, { useState, useEffect } from "react";
import {
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

const ManageArts = () => {
  const [artGroups, setArtGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);

  // Form state for art group details and individual arts
  const [formData, setFormData] = useState({
    title: "",
    translation: "",
  });
  const [artsData, setArtsData] = useState([{ file: null, description: "" }]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchArtGroups();
  }, []);

  const fetchArtGroups = async () => {
    try {
      const response = await fetch("https://api.museoningangeles.com/api/artGroups");
      if (!response.ok) {
        throw new Error("Failed to fetch art groups");
      }
      const data = await response.json();
      setArtGroups(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle text input changes for art group
  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle file change for each art entry
  const handleArtFileChange = (index, file) => {
    const newArtsData = [...artsData];
    newArtsData[index].file = file;
    setArtsData(newArtsData);
  };

  // Handle description change for each art entry
  const handleArtDescriptionChange = (index, value) => {
    const newArtsData = [...artsData];
    newArtsData[index].description = value;
    setArtsData(newArtsData);
  };

  // Add a new art input field
  const addArtField = () => {
    setArtsData([...artsData, { file: null, description: "" }]);
  };

  // Remove an art input field
  const removeArtField = (index) => {
    setArtsData(artsData.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // Validate art group fields
    if (!formData.title || !formData.translation) {
      setMessage("Art group title and translation are required.");
      return;
    }

    if (!editingGroup) {
      // In add mode, require each art to have file and description.
      for (let art of artsData) {
        if (!art.file || !art.description) {
          setMessage("All fields are required for each art.");
          return;
        }
      }
    } else {
      // In edit mode, check if the user wants to update art items.
      // If any new file is provided, then all art items must have new images and descriptions.
      const anyNewFiles = artsData.some((art) => art.file !== null);
      if (anyNewFiles && !artsData.every((art) => art.file && art.description)) {
        setMessage("To update art items, please upload images and provide descriptions for all art items.");
        return;
      }
    }

    setIsSubmitting(true);
    const fd = new FormData();
    fd.append("title", formData.title);
    fd.append("translation", formData.translation);

    // If in add mode or updating arts in edit mode, append images and descriptions.
    if (!editingGroup || artsData.some((art) => art.file !== null)) {
      artsData.forEach((art) => {
        fd.append("images", art.file);
      });
      const descriptions = artsData.map((art) => art.description);
      fd.append("descriptions", JSON.stringify(descriptions));
    }

    try {
      const method = editingGroup ? "PUT" : "POST";
      const url = editingGroup
        ? `https://api.museoningangeles.com/api/artGroups/${editingGroup.id}`
        : "https://api.museoningangeles.com/api/artGroups";
      const response = await fetch(url, { method, body: fd });
      const result = await response.json();
      if (response.ok) {
        setMessage(result.message);
        fetchArtGroups();
        handleCloseModal();
      } else {
        setMessage(result.error || "Failed to save art group.");
      }
    } catch (err) {
      setMessage("Error saving art group.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenModalForAdd = () => {
    setEditingGroup(null);
    setFormData({ title: "", translation: "" });
    setArtsData([{ file: null, description: "" }]);
    setMessage("");
    setOpenModal(true);
  };

  const handleEditClick = (group) => {
    setEditingGroup(group);
    setFormData({ title: group.title, translation: group.translation });
    // Prepopulate artsData with existing descriptions; file inputs remain empty.
    if (group.arts && group.arts.length > 0) {
      setArtsData(group.arts.map((art) => ({ file: null, description: art.description })));
    } else {
      setArtsData([{ file: null, description: "" }]);
    }
    setMessage("");
    setOpenModal(true);
  };

  const handleDelete = async (groupId) => {
    if (!window.confirm("Are you sure you want to delete this art group?")) return;
    try {
      const response = await fetch(`https://api.museoningangeles.com/api/artGroups/${groupId}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (response.ok) {
        setMessage(result.message);
        fetchArtGroups();
      } else {
        setMessage(result.error);
      }
    } catch (err) {
      setMessage("Error deleting art group.");
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  // Pagination calculations
  const totalPages = Math.ceil(artGroups.length / itemsPerPage);
  const currentArtGroups = artGroups.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
        Manage Art Groups & Arts
      </h1>

      {loading ? (
        <div className="flex justify-center items-center py-4">
          <CircularProgress />
        </div>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : artGroups.length === 0 ? (
        <p className="text-center text-gray-600">No art groups found.</p>
      ) : (
        <>
          <h2 className="text-2xl font-bold text-center mt-8 mb-4">
            Art Groups List
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full bg-white divide-y divide-gray-200 shadow rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Translation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentArtGroups.map((group) => (
                  <tr key={group.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {group.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {group.translation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(group.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        onClick={() => handleEditClick(group)}
                        className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(group.id)}
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
          Add New Art Group & Arts
        </button>
      </div>

      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle>
          {editingGroup ? "Edit Art Group & Arts" : "Add Art Group & Arts"}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            {message && (
              <p className="mb-4 text-center text-green-600">{message}</p>
            )}
            <div className="mb-4">
              <label className="block mb-1 font-medium text-gray-800">
                Art Group Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                placeholder="Enter art group title"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium text-gray-800">
                Art Group Translation
              </label>
              <input
                type="text"
                name="translation"
                value={formData.translation}
                onChange={handleFormChange}
                placeholder="Enter art group translation"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
                required
              />
            </div>
            {editingGroup && (
              <p className="mb-4 text-sm text-gray-600">
                Leave image inputs empty if you do not wish to update art items.
                To update, please upload new images for all art items.
              </p>
            )}
            {artsData.map((art, index) => (
              <div key={index} className="mb-6 border p-4 rounded relative">
                <button
                  type="button"
                  onClick={() => removeArtField(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-600"
                >
                  ❌
                </button>
                <h3 className="text-lg font-semibold mb-2">Art {index + 1}</h3>
                <div className="mb-4">
                  <label className="block mb-1 font-medium text-gray-800">
                    Upload Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleArtFileChange(index, e.target.files[0])
                    }
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
                    // In edit mode, file input is optional.
                    required={!editingGroup}
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1 font-medium text-gray-800">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={art.description}
                    onChange={(e) =>
                      handleArtDescriptionChange(index, e.target.value)
                    }
                    rows="3"
                    placeholder="Enter art description"
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-300"
                    required
                  ></textarea>
                </div>
              </div>
            ))}
            <div className="flex justify-center mb-4">
              <button
                type="button"
                onClick={addArtField}
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
              >
                Add Another Art
              </button>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} color="secondary">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} color="primary">
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : editingGroup ? (
                "Update Art Group"
              ) : (
                "Add Art Group"
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
};

export default ManageArts;

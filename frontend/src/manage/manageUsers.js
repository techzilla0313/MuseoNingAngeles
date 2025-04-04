import React, { useState, useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState("");
  const [tableLoading, setTableLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Toggle between "regular" and "admin" tables
  const [selectedTable, setSelectedTable] = useState("regular");

  // Separate pagination states for each table
  const [currentRegularPage, setCurrentRegularPage] = useState(1);
  const [currentAdminPage, setCurrentAdminPage] = useState(1);
  const itemsPerPage = 10;

  // State for Add New Admin Modal
  const [openAddAdminModal, setOpenAddAdminModal] = useState(false);
  const [newAdminUsername, setNewAdminUsername] = useState("");
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newAdminConfirmPassword, setNewAdminConfirmPassword] = useState("");
  const [newAdminError, setNewAdminError] = useState("");
  const [newAdminSuccess, setNewAdminSuccess] = useState("");
  const [newAdminLoading, setNewAdminLoading] = useState(false);

  useEffect(() => {
    const fetchCurrentUserRole = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decode JWT
          setCurrentUserRole(decodedToken.role);
        } catch (err) {
          console.error("Error decoding token", err);
        }
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await fetch("https://api.museoningangeles.com/api/users");
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        setUsers(data.users);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUserRole();
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setTableLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`https://api.museoningangeles.com/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error("Failed to update role");
      }

      setUsers(users.map((user) => (user.id === userId ? { ...user, role: newRole } : user)));
      alert("Role updated successfully.");
    } catch (error) {
      alert("Error updating role: " + error.message);
    } finally {
      setTableLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;

    setTableLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`https://api.museoningangeles.com/api/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      setUsers(users.filter((user) => user.id !== userId));
      alert("User deleted successfully.");
    } catch (error) {
      alert("Error deleting user: " + error.message);
    } finally {
      setTableLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentRegularPage(1);
    setCurrentAdminPage(1);
  };

  // Filter users based on the search term
  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Separate the filtered users into Regular and Admin groups
  const regularUsers = filteredUsers.filter((user) => user.role === "user");
  const adminUsers = filteredUsers.filter(
    (user) => user.role === "admin" || user.role === "super_admin"
  );

  // Pagination for Regular Users
  const totalRegularPages = Math.ceil(regularUsers.length / itemsPerPage);
  const currentRegularUsers = regularUsers.slice(
    (currentRegularPage - 1) * itemsPerPage,
    currentRegularPage * itemsPerPage
  );

  // Pagination for Admin Users
  const totalAdminPages = Math.ceil(adminUsers.length / itemsPerPage);
  const currentAdminUsers = adminUsers.slice(
    (currentAdminPage - 1) * itemsPerPage,
    currentAdminPage * itemsPerPage
  );

  const handleRegularPageChange = (pageNumber) => {
    setCurrentRegularPage(pageNumber);
  };

  const handleAdminPageChange = (pageNumber) => {
    setCurrentAdminPage(pageNumber);
  };

  // Handle submission of the Add New Admin form
  const handleAddAdminSubmit = async (e) => {
    e.preventDefault();
    setNewAdminError("");
    setNewAdminSuccess("");
    setNewAdminLoading(true);

    if (!newAdminUsername || !newAdminName || !newAdminEmail || !newAdminPassword || !newAdminConfirmPassword) {
      setNewAdminError("All fields are required.");
      setNewAdminLoading(false);
      return;
    }

    if (newAdminPassword !== newAdminConfirmPassword) {
      setNewAdminError("Passwords do not match.");
      setNewAdminLoading(false);
      return;
    }

    try {
      const response = await fetch("https://api.museoningangeles.com/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Set role to 'admin' by default for new admin accounts.
        body: JSON.stringify({
          username: newAdminUsername,
          name: newAdminName,
          email: newAdminEmail,
          password: newAdminPassword,
          role: "admin",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setNewAdminSuccess("Admin account created successfully!");
        // Optionally, refresh the users list.
        const refreshed = await fetch("https://api.museoningangeles.com/api/users");
        const refreshedData = await refreshed.json();
        setUsers(refreshedData.users);
        // Reset form fields
        setNewAdminUsername("");
        setNewAdminName("");
        setNewAdminEmail("");
        setNewAdminPassword("");
        setNewAdminConfirmPassword("");
        // Close the modal after a short delay
        setTimeout(() => {
          setOpenAddAdminModal(false);
          setNewAdminSuccess("");
        }, 1500);
      } else {
        setNewAdminError(data.error || "An error occurred during admin registration.");
      }
    } catch (error) {
      setNewAdminError("Failed to connect to the server.");
    } finally {
      setNewAdminLoading(false);
    }
  };

  const handleAddNewAdmin = () => {
    setOpenAddAdminModal(true);
  };

  if (loading)
    return <div className="text-center py-6 text-lg font-medium">Loading...</div>;
  if (error)
    return <div className="text-center py-6 text-red-600 text-lg">Error: {error}</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Manage Users</h1>

      {/* Global Search Input */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by username, name, or email"
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full p-3 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>

      {/* Toggle Tabs for Selecting Table */}
      <div className="flex border-b mb-6">
        <div
          onClick={() => setSelectedTable("regular")}
          className={`w-1/2 text-center py-2 cursor-pointer ${
            selectedTable === "regular"
              ? "border-b-4 border-yellow-600 text-yellow-600 font-semibold"
              : "text-gray-600"
          }`}
        >
          Regular Users
        </div>
        <div
          onClick={() => setSelectedTable("admin")}
          className={`w-1/2 text-center py-2 cursor-pointer ${
            selectedTable === "admin"
              ? "border-b-4 border-yellow-600 text-yellow-600 font-semibold"
              : "text-gray-600"
          }`}
        >
          Admin Accounts
        </div>
      </div>

      {/* Conditionally Render the Selected Table */}
      {selectedTable === "regular" && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Regular Users</h2>
          {regularUsers.length === 0 ? (
            <div className="text-center text-gray-600">No regular users found.</div>
          ) : (
            <>
              <div className="relative mb-4">
                {tableLoading && (
                  <div className="absolute inset-0 z-10 flex justify-center items-center bg-white bg-opacity-80">
                    <CircularProgress />
                  </div>
                )}
                <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Username</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentRegularUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm text-gray-800">{user.id}</td>
                        <td className="px-6 py-3 text-sm text-gray-800">{user.username}</td>
                        <td className="px-6 py-3 text-sm text-gray-800">{user.name}</td>
                        <td className="px-6 py-3 text-sm text-gray-800">{user.email}</td>
                        <td className="px-6 py-3 text-sm text-gray-800 capitalize">{user.role}</td>
                        <td className="px-6 py-3 text-center">
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition duration-150"
                          >
                            Remove User
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalRegularPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-4">
                  <button
                    onClick={() => handleRegularPageChange(currentRegularPage - 1)}
                    disabled={currentRegularPage === 1}
                    className={`px-3 py-1 rounded ${
                      currentRegularPage === 1
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-yellow-600 text-white hover:bg-yellow-700"
                    }`}
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalRegularPages }, (_, idx) => idx + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handleRegularPageChange(page)}
                      className={`px-3 py-1 rounded ${
                        page === currentRegularPage
                          ? "bg-yellow-600 text-white"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => handleRegularPageChange(currentRegularPage + 1)}
                    disabled={currentRegularPage === totalRegularPages}
                    className={`px-3 py-1 rounded ${
                      currentRegularPage === totalRegularPages
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
        </div>
      )}

      {selectedTable === "admin" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Admin Accounts</h2>
            {currentUserRole === "super_admin" && (
              <button
                onClick={handleAddNewAdmin}
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition duration-150"
              >
                Add New Admin
              </button>
            )}
          </div>
          {adminUsers.length === 0 ? (
            <div className="text-center text-gray-600">No admin accounts found.</div>
          ) : (
            <>
              <div className="relative mb-4">
                {tableLoading && (
                  <div className="absolute inset-0 z-10 flex justify-center items-center bg-white bg-opacity-80">
                    <CircularProgress />
                  </div>
                )}
                <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Username</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentAdminUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm text-gray-800">{user.id}</td>
                        <td className="px-6 py-3 text-sm text-gray-800">{user.username}</td>
                        <td className="px-6 py-3 text-sm text-gray-800">{user.name}</td>
                        <td className="px-6 py-3 text-sm text-gray-800">{user.email}</td>
                        <td className="px-6 py-3 text-sm text-gray-800 capitalize">{user.role}</td>
                        <td className="px-6 py-3 text-center">
                          {user.role !== "super_admin" ? (
                            <>
                              <button
                                onClick={() =>
                                  handleRoleChange(
                                    user.id,
                                    user.role === "admin" ? "user" : "admin"
                                  )
                                }
                                className="px-3 py-1 bg-yellow-700 text-white text-sm rounded mr-2 hover:bg-yellow-800 transition duration-150"
                              >
                                {user.role === "admin" ? "Remove Admin" : "Make Admin"}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition duration-150"
                              >
                                Remove User
                              </button>
                            </>
                          ) : (
                            <button
                              className="px-3 py-1 bg-gray-500 text-white text-sm rounded cursor-not-allowed"
                              disabled
                            >
                              Super Admin
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalAdminPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-4">
                  <button
                    onClick={() => handleAdminPageChange(currentAdminPage - 1)}
                    disabled={currentAdminPage === 1}
                    className={`px-3 py-1 rounded ${
                      currentAdminPage === 1
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-yellow-600 text-white hover:bg-yellow-700"
                    }`}
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalAdminPages }, (_, idx) => idx + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handleAdminPageChange(page)}
                      className={`px-3 py-1 rounded ${
                        page === currentAdminPage
                          ? "bg-yellow-600 text-white"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => handleAdminPageChange(currentAdminPage + 1)}
                    disabled={currentAdminPage === totalAdminPages}
                    className={`px-3 py-1 rounded ${
                      currentAdminPage === totalAdminPages
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
        </div>
      )}

      {/* Modal for Adding New Admin */}
      <Dialog open={openAddAdminModal} onClose={() => setOpenAddAdminModal(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add New Admin</DialogTitle>
        <form onSubmit={handleAddAdminSubmit}>
          <DialogContent dividers>
            {newAdminError && <p className="text-red-500 mb-4">{newAdminError}</p>}
            {newAdminSuccess && <p className="text-green-500 mb-4">{newAdminSuccess}</p>}
            <div className="mb-4">
              <label className="block text-sm mb-2">Username</label>
              <input
                type="text"
                value={newAdminUsername}
                onChange={(e) => setNewAdminUsername(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-2">Name</label>
              <input
                type="text"
                value={newAdminName}
                onChange={(e) => setNewAdminName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-2">Email</label>
              <input
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-2">Password</label>
              <input
                type="password"
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-2">Confirm Password</label>
              <input
                type="password"
                value={newAdminConfirmPassword}
                onChange={(e) => setNewAdminConfirmPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAddAdminModal(false)} color="secondary">
              Cancel
            </Button>
            <Button type="submit" disabled={newAdminLoading} color="primary">
              {newAdminLoading ? "Adding..." : "Add Admin"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
};

export default ManageUsers;

"use client";
import withAuth from "../hoc/withAuth";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@mui/material";
import BackButton from "../components/BackButton";
import "./page.css";

function ManageUsers() {

const [users, setUsers] = useState([]);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:3002/api/users`);
      const data = await response.json();
      const nonAdminUsers = data.items.filter(user => user.userTypeId !== 1);
      setUsers(nonAdminUsers);
    } catch (error) {
      console.error("Error fetching users: ", error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSuspendUser = async (id, fullName, currentlySuspended) => {
    const action = currentlySuspended ? "unsuspend" : "suspend";
    if (!window.confirm(`Are you sure you want to ${action} User: ${fullName}?`)) return;
    try {
      const newStatusId = currentlySuspended ? 2 : 3;
      const response = await fetch(`http://localhost:3002/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userStatusId: newStatusId }),
      });
      if (!response.ok) {
        const error = await response.json();
        alert(`Failed to ${action} user: ` + (error?.error || response.statusText));
        return;
      }
      await fetchUsers(); // refresh after update
      alert(`User "${fullName}" has been ${action}ed.`);
    } catch (err) {
      alert(`Failed to ${action} user due to network error.`);
      console.error(err);
    }
  };

  const handlePromoteUser = async (id, fullName) => {
    if (!window.confirm(`Promote ${fullName} to admin?`)) return;
    try {
      const response = await fetch(`http://localhost:3002/api/admin/users/${id}/promote`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const error = await response.json();
        alert(`Failed to promote user: ${error?.error || response.statusText}`);
        return;
      }
      await fetchUsers(); // refresh after update
      alert(`User "${fullName}" has been promoted to admin.`);
    } catch (err) {
      alert("Failed to promote user due to network error.");
      console.error(err);
    }
  };

  const handleDeleteUser = async (id, fullName) => {
    if (!window.confirm(`Delete user ${fullName}? This cannot be undone.`)) return;
    try {
      const response = await fetch(`http://localhost:3002/api/admin/users/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const error = await response.json();
        alert(`Failed to delete user: ${error?.error || response.statusText}`);
        return;
      }
      await fetchUsers(); // refresh after delete
      alert(`User "${fullName}" has been deleted.`);
    } catch (err) {
      alert("Failed to delete user due to network error.");
      console.error(err);
    }
  };



  return (
    <div className="manage-users">
      <BackButton route="/admin-home" />
      <div className="users-table-container">
        <h2>Registered Users</h2>
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.firstName}</td>
                  <td>{user.lastName}</td>
                  <td>{user.email}</td>
                  <td>{user.phoneNumber || "-"}</td>
                  <td>
                    {user.userStatusId === 3 ? (
                      <button
                        className="unsuspend-user-btn"
                        onClick={() => handleSuspendUser(user.id, `${user.firstName} ${user.lastName}`, true)}
                      >
                        Unsuspend
                      </button>
                    ) : (
                      <button
                        className="suspend-user-btn"
                        onClick={() => handleSuspendUser(user.id, `${user.firstName} ${user.lastName}`, false)}
                      >
                        Suspend
                      </button>
                    )}
                    <button
                      className="promote-user-btn"
                      onClick={() => handlePromoteUser(user.id, `${user.firstName} ${user.lastName}`)}
                    >
                      Promote
                    </button>
                    <button
                      className="delete-user-btn"
                      onClick={() => handleDeleteUser(user.id, `${user.firstName} ${user.lastName}`)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  
    );
  }
  
  export default withAuth(ManageUsers, [1]);
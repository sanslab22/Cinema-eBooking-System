"use client";
import { useEffect, useState } from "react";
import "./page.css";

export default function ManageUsers() {

  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function fetchUsers(){
      try {
        const response = await fetch(`http://localhost:3002/api/users`); //api to be defined later
        const data = await response.json();

        const nonAdminUsers = data.items.filter((user) => user.userTypeId !== 1);
        setUsers(nonAdminUsers);
      } catch (error) {
        console.error("Error fetching users: ", error);
      }
    }

    fetchUsers();
  }, []);

  //front end only
  const handleSuspendUser = async (id, fullName, currentlySuspended) => {
    const action = currentlySuspended ? "unsuspend" : "suspend";
    const confirmed = window.confirm(`Are you sure you want to ${action} User: ${fullName}?`);
    if (!confirmed) return;

    try {
      const newStatusId = currentlySuspended ? 2 : 3;     // 2 is inactive user and 3 is suspended user
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

      setUsers(prev =>
        prev.map(user =>
          user.id === id ? { ...user, userStatusId: newStatusId } : user
        )
      );
      alert(`User "${fullName}" has been ${action}ed.`);
    } catch (err) {
      alert(`Failed to ${action} user due to network error.`);
      console.error(err);
    }
  };


  return (
    <div className="manage-users">
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
"use client";
import { useEffect, useState } from "react";
import "./page.css";

export default function ManageUsers() {

  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function fetchUsers(){
      try {
        const response = await fetch("/api/users"); //api to be defined later
        const data = await response.json();

        const nonAdminUsers = data.filter((user) => user.userTypeId !==1);
        setUsers(nonAdminUsers);
      } catch (error) {
        console.error("Error fetching users: ", error);
      }
    }

    fetchUsers();
  }, []);

  //front end only
  const handleRemoveUser = (id) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
    console.log(`User with ID ${id} removed (frontend only).`);
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
                    <button
                      className="remove-user-btn"
                      onClick={() => handleRemoveUser(user.id)}
                    >
                      Remove
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
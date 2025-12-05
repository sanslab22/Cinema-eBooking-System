"use client";

import withAuth from "../hoc/withAuth";
import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import "./page.css";
import { Button, TextField } from "@mui/material"; // Added TextField for cleaner inputs
import BackButton from "../components/BackButton";

function ManagePromotions() {
  const [promotions, setPromotions] = useState([]);

  const [promotion, setPromotion] = useState({
    promoCode: "",
    startDate: "",
    expirationDate: "",
    promoValue: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [tickets, setTickets] = useState([]);
  const [editTicketId, setEditTicketId] = useState(null);
  const [tempPrice, setTempPrice] = useState(""); // Stores price while editing

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem("token"); // OR sessionStorage.getItem("token");

      const response = await fetch("http://localhost:3002/api/admin/tickets", {
        headers: {
          Authorization: `Bearer ${token}`, // <--- Vital for Admin Routes
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch tickets");
      }

      const data = await response.json();
      setTickets(data);
    } catch (err) {
      console.error("Error fetching tickets:", err);
      // Optional: setErrorMessage(err.message);
    }
  };

  useEffect(() => {
    fetchPromotions();
    fetchTickets(); // Load tickets on mount
  }, []);

  const handleEditTicket = (ticket) => {
    setEditTicketId(ticket.id);
    setTempPrice(ticket.price);
  };

  const handleCancelTicketEdit = () => {
    setEditTicketId(null);
    setTempPrice("");
  };

  const handleSaveTicket = async (id) => {
    try {
      // 1. Validation
      const priceValue = parseFloat(tempPrice);
      if (isNaN(priceValue) || priceValue < 0) {
        alert("Please enter a valid price");
        return;
      }

      // 2. API Call
      const response = await fetch(
        `http://localhost:3002/api/admin/tickets/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ price: priceValue }),
        }
      );

      if (!response.ok) throw new Error("Failed to update ticket price");

      // 3. Update Local State (Reflect change in UI)
      const updatedTickets = tickets.map((t) =>
        t.id === id ? { ...t, price: priceValue } : t
      );
      setTickets(updatedTickets);

      // 4. Reset Edit Mode & Show Success
      setEditTicketId(null);
      setSuccessMessage("Ticket price updated successfully.");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to save ticket price. Check console for details.");
    }
  };

  const formatDateForInput = (isoDateString) => {
    if (!isoDateString) return "";
    const date = new Date(isoDateString);
    return date.toISOString().split("T")[0];
  };

  const sendPromotionToSubscribedUsers = async (newPromotion) => {
    try {
      const response = await fetch(
        "http://localhost:3002/api/admin/subscribed-emails"
      );
      if (!response.ok) throw new Error("Failed to fetch subscribed users.");
      const emails = await response.json();
      if (emails.length === 0) return;

      await addDoc(collection(db, "mail"), {
        to: emails,
        message: {
          subject: `New Promotion: ${newPromotion.promoCode}!`,
          html: `
          <p>Dear Customer,</p>
          <p>A new promotion has been released!</p>
          <p><b>Promo Code: ${newPromotion.promoCode}</b></p>
          <p><b>Discount: ${newPromotion.promoValue}%</b></p>
          <p><b>Start Date: ${new Date(
            newPromotion.startDate
          ).toLocaleDateString()}</b></p>
          <p><b>End Date: ${new Date(
            newPromotion.expirationDate
          ).toLocaleDateString()}</b></p>
          <p>We hope to see you at the theaters soon!</p>
        `,
        },
      });
    } catch (err) {
      console.error("Failed to send promotion email:", err.message);
    }
  };

  const fetchPromotions = async () => {
    try {
      const response = await fetch(
        "http://localhost:3002/api/admin/promotions"
      );
      if (!response.ok) throw new Error("Failed to fetch promotions");
      const data = await response.json();
      setPromotions(data);
    } catch (err) {
      setError(true);
      setErrorMessage(err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPromotion((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this promotion?"))
      return;
    try {
      const response = await fetch(
        `http://localhost:3002/api/admin/promotions/${id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("Failed to delete promotion");
      setSuccessMessage("Promotion deleted successfully.");
      fetchPromotions();
      if (isEditing && editId === id) handleCancel();
    } catch (err) {
      setError(true);
      setErrorMessage(err.message);
    }
  };

  const handleEdit = (promo) => {
    setError(false);
    setSuccessMessage("");
    setIsEditing(true);
    setEditId(promo.id);
    setPromotion({
      promoCode: promo.promoCode,
      promoValue: promo.promoValue,
      startDate: formatDateForInput(promo.startDate),
      expirationDate: formatDateForInput(promo.expirationDate),
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditId(null);
    setPromotion({
      promoCode: "",
      startDate: "",
      expirationDate: "",
      promoValue: "",
    });
    setError(false);
    setSuccessMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(false);
    setSuccessMessage("");

    const discount = Number(promotion.promoValue);
    if (isNaN(discount) || discount < 1 || discount > 100) {
      setError(true);
      setErrorMessage("Discount must be a number between 1 and 100.");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.expirationDate);

    startDate.setMinutes(
      startDate.getMinutes() + startDate.getTimezoneOffset()
    );
    endDate.setMinutes(endDate.getMinutes() + endDate.getTimezoneOffset());

    if (!isEditing && startDate < today) {
      setError(true);
      setErrorMessage("Start date cannot be in the past.");
      return;
    }
    if (endDate < startDate) {
      setError(true);
      setErrorMessage("End date must be on or after the start date.");
      return;
    }

    try {
      let response;
      if (isEditing) {
        response = await fetch(
          `http://localhost:3002/api/admin/promotions/${editId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(promotion),
          }
        );
      } else {
        response = await fetch("http://localhost:3002/api/admin/promotions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(promotion),
        });
      }

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || data.message || "Operation failed");

      if (!isEditing) {
        await sendPromotionToSubscribedUsers(promotion);
        setSuccessMessage("Promotion created successfully!");
      } else {
        setSuccessMessage("Promotion updated successfully!");
      }
      handleCancel();
      fetchPromotions();
    } catch (err) {
      setError(true);
      setErrorMessage(err.message);
    }
  };

  return (
    <div className="manage-promotions">
      <BackButton route="/admin-home" />

      {/* --- PROMOTIONS SECTION --- */}
      <div className="content-wrapper">
        <div className="promotions-list">
          <h2>Existing Promotions</h2>
          {promotions.length > 0 ? (
            <table className="promotions-table">
              <thead>
                <tr>
                  <th>Promo Code</th>
                  <th>Discount</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {promotions.map((promo) => (
                  <tr key={promo.id}>
                    <td>{promo.promoCode}</td>
                    <td>{promo.promoValue}%</td>
                    <td>{new Date(promo.startDate).toLocaleDateString()}</td>
                    <td>
                      {new Date(promo.expirationDate).toLocaleDateString()}
                    </td>
                    <td>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => handleEdit(promo)}
                        style={{ marginRight: "5px" }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        onClick={() => handleDelete(promo.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No promotions found.</p>
          )}
        </div>

        <div className="form-container">
          <h2>{isEditing ? "Edit Promotion" : "Add New Promotion"}</h2>
          <br />
          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{errorMessage}</div>}
            {successMessage && (
              <div className="success-message">{successMessage}</div>
            )}

            <label>
              Promo Code
              <input
                type="text"
                name="promoCode"
                value={promotion.promoCode}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Start Date
              <input
                type="date"
                name="startDate"
                value={promotion.startDate}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              End Date
              <input
                type="date"
                name="expirationDate"
                value={promotion.expirationDate}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Discount (%)
              <input
                type="number"
                name="promoValue"
                value={promotion.promoValue}
                onChange={handleChange}
                min="1"
                max="100"
                required
              />
            </label>
            <div className="button-container">
              <Button type="submit" variant="contained" color="primary">
                {isEditing ? "Update Promotion" : "Create Promotion"}
              </Button>
              {isEditing && (
                <Button
                  type="button"
                  variant="outlined"
                  color="secondary"
                  onClick={handleCancel}
                  style={{ marginLeft: "10px" }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
          <p
            style={{
              textAlign: "center",
              marginTop: "15px",
              fontSize: "0.8rem",
              color: "#666",
            }}
          >
            Note: All dates are in Central Time (CT).
          </p>
        </div>
      </div>

      {/* --- DIVIDER --- */}
      <hr className="section-divider" />

      {/* --- TICKET PRICING SECTION --- */}
      <div className="tickets-section">
        <h2>Manage Ticket Prices</h2>
        <div className="tickets-table-container">
          <table className="promotions-table tickets-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Price ($)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>{ticket.category}</td>

                  {/* PRICE COLUMN: Shows Input if editing, Text if not */}
                  <td>
                    {editTicketId === ticket.id ? (
                      <input
                        type="number"
                        className="price-input"
                        step="0.01"
                        value={tempPrice}
                        onChange={(e) => setTempPrice(e.target.value)}
                      />
                    ) : (
                      `$${Number(ticket.price).toFixed(2)}`
                    )}
                  </td>

                  {/* ACTION COLUMN */}
                  <td>
                    {editTicketId === ticket.id ? (
                      <>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => handleSaveTicket(ticket.id)}
                          style={{ marginRight: "5px" }}
                        >
                          Save
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="secondary"
                          onClick={handleCancelTicketEdit}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => handleEditTicket(ticket)}
                      >
                        Edit Price
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default withAuth(ManagePromotions, [1]);

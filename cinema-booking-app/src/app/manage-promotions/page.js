"use client";

import withAuth from "../hoc/withAuth";
import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import "./page.css";
import { Button } from "@mui/material";
import BackButton from "../components/BackButton";

function ManagePromotions() {
  const [promotions, setPromotions] = useState([]);

  const [promotion, setPromotion] = useState({
    promoCode: "",
    startDate: "",
    expirationDate: "",
    promoValue: "",
  });

  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const sendPromotionToSubscribedUsers = async (newPromotion) => {
    try {
      // 1. Fetch the list of subscribed user emails from the new backend endpoint
      const response = await fetch("http://localhost:3002/api/admin/subscribed-emails");
      if (!response.ok) {
        throw new Error("Failed to fetch subscribed users.");
      }
      const emails = await response.json();

      if (emails.length === 0) {
        console.log("No subscribed users to email.");
        return; // No one to email, so we're done.
      }

      // 2. Send the email to all subscribed users via the Firebase mail service
      await addDoc(collection(db, "mail"), {
        to: emails, // The `to` field can be an array of email addresses
        message: {
          subject: `New Promotion: ${newPromotion.promoCode}!`,
          html: `
          <p>Dear Customer,</p>
          <p>A new promotion has been released!</p>
          <p><b>Promo Code: ${newPromotion.promoCode}</b></p>
          <p><b>Discount: ${newPromotion.promoValue}%</b></p>
          <p><b>Start Date: ${new Date(newPromotion.startDate).toLocaleDateString()}</b></p>
          <p><b>End Date: ${new Date(newPromotion.expirationDate).toLocaleDateString()}</b></p>
          <p>We hope to see you at the theaters soon!</p>
        `,
        },
      });

      console.log(`Promotion email sent to ${emails.length} users.`);

    } catch (err) {
      // We can show an error, but we won't overwrite the "Promotion Created" success message.
      console.error("Failed to send promotion email:", err.message);
    }
  };

  const fetchPromotions = async () => {
    try {
      const response = await fetch(
        "http://localhost:3002/api/admin/promotions"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch promotions");
      }
      const data = await response.json();
      setPromotions(data);
    } catch (err) {
      setError(true);
      setErrorMessage(err.message);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPromotion((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(false);
    setSuccessMessage("");

    // --- Validation Logic ---

    // Validate new promotion
    const requiredFields = ["promoCode", "startDate", "expirationDate", "promoValue"];


    // 1. Validate Discount Value
    const discount = Number(promotion.promoValue);
    if (isNaN(discount) || discount < 1 || discount > 100) {
      setError(true);
      setErrorMessage("Discount must be a number between 1 and 100.");
      return;
    }

    // 2. Validate Dates
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date to midnight for accurate comparison

    // Create date objects from the form inputs
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.expirationDate);

    // Adjust for timezone differences by adding the offset to UTC dates
    startDate.setMinutes(startDate.getMinutes() + startDate.getTimezoneOffset());
    endDate.setMinutes(endDate.getMinutes() + endDate.getTimezoneOffset());

    if (startDate < today) {
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
      const response = await fetch("http://localhost:3002/api/admin/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(promotion),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to create promotion");
      }

      // On success, send the email to subscribed users
      await sendPromotionToSubscribedUsers(promotion);

      setSuccessMessage("Promotion created successfully!");
      setPromotion({
        promoCode: "",
        startDate: "",
        expirationDate: "",
        promoValue: "",
      });
      fetchPromotions(); // Refresh the list after adding
    } catch (err) {
      setError(true);
      setErrorMessage(err.message);
    }
  };

  return (
    <div className="manage-promotions">
      <BackButton route="/admin-home" />
      <h1 className="title">Manage Promotions</h1>

      <div className="content-wrapper">
        <div className="promotions-list">
          <h2>Existing Promotions</h2>
          {promotions.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Promo Code</th>
                  <th>Discount</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                </tr>
              </thead>
              <tbody>
                {promotions.map((promo) => (
                  <tr key={promo.id}>
                    <td>{promo.promoCode}</td>
                    <td>{promo.promoValue}%</td>
                    <td>{new Date(promo.startDate).toLocaleDateString()}</td>
                    <td>{new Date(promo.expirationDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No promotions found.</p>
          )}
        </div>

        <div className="form-container">
          <h2>Add New Promotion</h2>
          <br />
          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{errorMessage}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}

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
                Create Promotion
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default withAuth(ManagePromotions, [1]);

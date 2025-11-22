"use client";

import { useState } from "react";
import "./page.css";
import { Button } from "@mui/material";

export default function ManagePromotions() {

  const [promotion, setPromotion] = useState({
    promoCode: "",
    startDate: "",
    endDate: "",
    discountPercent: "",
  });

  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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

    // Basic validation: ensure all fields are filled
    const missingField = Object.entries(promotion).find(([_, value]) => value === "");
    if (missingField) {
      setError(true);
      setErrorMessage(`Please fill in the ${missingField[0]} field.`);
      return;
    }

    try {
      const response = await fetch("http://localhost:3002/api/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(promotion),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create promotion");
      }

      setSuccessMessage("Promotion created successfully!");
      setPromotion({
        promoCode: "",
        startDate: "",
        endDate: "",
        discountPercent: "",
      });
    } catch (err) {
      setError(true);
      setErrorMessage(err.message);
    }
  };


  return (
    <div className="manage-promotions">

      <h1 className="title">Add New Promotion</h1>

      <div className='button-container'>
        <Button className="promotion-button">
          Add Promotion
        </Button>
        <Button className="promotion-button">
          Send Promotion
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        
        {error && <div className="error-message">{errorMessage}</div>}
        {successMessage && (
          <div className="error-message" style={{ backgroundColor: "green" }}>
            {successMessage}
          </div>
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
            name="endDate"
            value={promotion.endDate}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Discount (%) 
          <input
            type="number"
            name="discountPercent"
            value={promotion.discountPercent}
            onChange={handleChange}
            min="1"
            max="100"
            required
          />
        </label>

        <div className="button-container">
          <Button className="promotion-button">
            Create Promotion
          </Button>
        </div>
      </form>

    </div>
  );
}
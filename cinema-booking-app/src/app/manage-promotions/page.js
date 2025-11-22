"use client";

import { useState, useEffect } from "react";
import "./page.css";
import { Button } from "@mui/material";
import BackButton from "../components/BackButton";

export default function ManagePromotions() {
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

  const fetchPromotions = async () => {
    try {
      const response = await fetch("http://localhost:3002/api/admin/promotions");
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
            name="discountPercent"
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
    </div>
  );
}
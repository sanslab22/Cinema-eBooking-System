'use client'
import React, { useState } from "react";
import "./page.css";

export default function EditProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [promotions, setPromotions] = useState(true);

  // Sample user data
  const [user, setUser] = useState({
    firstName: "Jenna",
    lastName: "Martin",
    email: "jenna@example.com",
    billingAddress: {
      street: "123 Main St",
      apt: "Apt 4B",
      city: "Atlanta",
      state: "GA",
      zip: "30301",
    },
    password: "********",
    paymentCards: [
      { cardNumber: "**** **** **** 1234", name: "Jenna Martin", expiry: "05/26", cvv: "***", zip: "30301" },
    ],
  });

  const handleInputChange = (e, field, subfield, index) => {
    if (subfield) {
      const updated = { ...user };
      if (field === "billingAddress") {
        updated.billingAddress[subfield] = e.target.value;
      } else if (field === "paymentCards") {
        updated.paymentCards[index][subfield] = e.target.value;
      }
      setUser(updated);
    } else {
      setUser({ ...user, [field]: e.target.value });
    }
  };

  const toggleEdit = () => setIsEditing(!isEditing);

  const handleAddCard = () => {
    if (user.paymentCards.length >= 4) {
      alert("You can only store up to 4 payment cards.");
      return;
    }
    setUser({
      ...user,
      paymentCards: [...user.paymentCards, { cardNumber: "", name: "", expiry: "", cvv: "", zip: "" }],
    });
  };

  const handleRemoveCard = (index) => {
    const updated = user.paymentCards.filter((_, i) => i !== index);
    setUser({ ...user, paymentCards: updated });
  };

  return (
    <div className="profile-container">
      <h1>My Profile</h1>

      {!isEditing ? (
        <div className="profile-view">
          <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Billing Address:</strong> {user.billingAddress.street}, {user.billingAddress.apt}, {user.billingAddress.city}, {user.billingAddress.state} {user.billingAddress.zip}</p>
          <p><strong>Password:</strong> {user.password}</p>
          <div>
            <strong>Payment Cards:</strong>
            <ul>
              {user.paymentCards.map((card, i) => (
                <li key={i}>{card.cardNumber} — {card.name} ({card.expiry})</li>
              ))}
            </ul>
          </div>
          <p><strong>Promotions:</strong> {promotions ? "Registered" : "Unregistered"}</p>
          <button onClick={toggleEdit}>Edit Profile</button>
        </div>
      ) : (
        <div className="profile-edit">
          <div className="form-section">
            <label>First Name:</label>
            <input value={user.firstName} onChange={(e) => handleInputChange(e, "firstName")} />

            <label>Last Name:</label>
            <input value={user.lastName} onChange={(e) => handleInputChange(e, "lastName")} />

            <label>Email (cannot edit):</label>
            <input value={user.email} disabled />

            <label>Password:</label>
            <input type="password" value={user.password} onChange={(e) => handleInputChange(e, "password")} />
          </div>

          <div className="form-section">
            <h3>Billing Address</h3>
            <input placeholder="Street" value={user.billingAddress.street} onChange={(e) => handleInputChange(e, "billingAddress", "street")} />
            <input placeholder="Apt #" value={user.billingAddress.apt} onChange={(e) => handleInputChange(e, "billingAddress", "apt")} />
            <input placeholder="City" value={user.billingAddress.city} onChange={(e) => handleInputChange(e, "billingAddress", "city")} />
            <input placeholder="State" value={user.billingAddress.state} onChange={(e) => handleInputChange(e, "billingAddress", "state")} />
            <input placeholder="Zip Code" value={user.billingAddress.zip} onChange={(e) => handleInputChange(e, "billingAddress", "zip")} />
          </div>

          <div className="form-section">
            <h3>Payment Cards</h3>
            {user.paymentCards.map((card, i) => (
              <div key={i} className="card-entry">
                <input placeholder="Card Number" value={card.cardNumber} onChange={(e) => handleInputChange(e, "paymentCards", "cardNumber", i)} />
                <input placeholder="Name on Card" value={card.name} onChange={(e) => handleInputChange(e, "paymentCards", "name", i)} />
                <input placeholder="Expiry (MM/YY)" value={card.expiry} onChange={(e) => handleInputChange(e, "paymentCards", "expiry", i)} />
                <input placeholder="CVV" value={card.cvv} onChange={(e) => handleInputChange(e, "paymentCards", "cvv", i)} />
                <input placeholder="Zip Code" value={card.zip} onChange={(e) => handleInputChange(e, "paymentCards", "zip", i)} />
                <button onClick={() => handleRemoveCard(i)}>Remove</button>
              </div>
            ))}
            <button onClick={handleAddCard}>Add Card</button>
          </div>

          <div className="form-section promotions">
            <label>
              <input
                type="checkbox"
                checked={promotions}
                onChange={() => setPromotions(!promotions)}
              />{" "}
              Receive Promotions
            </label>
          </div>

          <div className="button-row">
            <button onClick={toggleEdit}>Save</button>
          </div>
        </div>
      )}
    </div>
  );
}
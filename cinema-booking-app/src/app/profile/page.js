'use client'
import React, { useState, useEffect } from "react";
import "./page.css";

export default function EditProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [promotions, setPromotions] = useState(false); // Will be set by fetch
  const [user, setUser] = useState(null); // Start with null

  // States for loading, errors, and cancellation
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [originalUser, setOriginalUser] = useState(null);
  const [originalPromotions, setOriginalPromotions] = useState(false);


  useEffect(() => {

    // 1. Get the userId and token from localStorage
    const userId = localStorage.getItem('userId');
    //const token = localStorage.getItem('authToken');


    // 2. Check if they are logged in
    if (!userId) {
      setLoading(false);
      setError("You must be logged in to view this page.");
      // You should redirect here:
      //router.push('/login');
      return; 
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 3. Use the 'userId' from localStorage in the fetch URL
        // This will become "http://localhost:3001/api/users/4"
        const response = await fetch(`http://localhost:3001/api/users/${userId}`);


        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const backendData = await response.json();

        // Transform backend data to fit frontend state
        // Use home address (addressTypeId: 1)
        const homeAddress = backendData.addresses.find(addr => addr.addressTypeId === 1) || {
          street: "", apt: "", city: "", state: "", zip: "",
        };

        const frontendUser = {
          firstName: backendData.firstName,
          lastName: backendData.lastName,
          email: backendData.email,
          // Set billingAddress to be the homeAddress
          billingAddress: homeAddress, 
          password: "", // Never fetch/store the real password
          paymentCards: backendData.paymentCards || [],
        };

        // Set the state
        setUser(frontendUser);
        setPromotions(backendData.EnrollforPromotions || false);
        
        // Store original state for "Cancel" button
        setOriginalUser(JSON.parse(JSON.stringify(frontendUser))); // Deep copy
        setOriginalPromotions(backendData.EnrollforPromotions || false);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []); // 5. Set to [] to run only once when the page loads

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
    // Note: Your backend supports 3, your frontend check says 4.
    if (user.paymentCards.length >= 3) { 
      alert("You can only store up to 3 payment cards.");
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

  const handleCancelClick = () => {
    // Revert changes from the stored original state
    setUser(originalUser);
    setPromotions(originalPromotions);
    setIsEditing(false);
  };

  // --- This handleSaveClick is now fixed (No Token) ---
  const handleSaveClick = async () => {
    // 1. Get ID from localStorage
    const userId = localStorage.getItem('userId');

    // 2. Check ONLY for userId
    if (!userId) { 
      alert("You must be logged in to save.");
      return;
    }

    try {
      // Transform frontend state BACK to backend format
      const backendPayload = {
        firstName: user.firstName,
        lastName: user.lastName,
        EnrollforPromotions: promotions,
        homeAddress: user.billingAddress, 
        paymentCards: user.paymentCards,
      };

      // Only send password if the user entered a new one
      if (user.password && user.password !== "") {
        backendPayload.password = user.password;
      }

      // 3. Send the PUT request WITHOUT the Authorization header
      const response = await fetch(`http://localhost:3001/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // No 'Authorization' line here
        },
        body: JSON.stringify(backendPayload),
      });

      if (!response.ok) {
        throw new Error('Failed to save profile');
      }
      
      const savedBackendData = await response.json();

      // Re-transform the saved data to update our state
      const homeAddress = savedBackendData.addresses.find(addr => addr.addressTypeId === 1) || { street: "", apt: "", city: "", state: "", zip: "" };
      const savedFrontendUser = {
        firstName: savedBackendData.firstName,
        lastName: savedBackendData.lastName,
        email: savedBackendData.email,
        billingAddress: homeAddress,
        password: "", // Always clear password field after save
        paymentCards: savedBackendData.paymentCards || [],
      };

      setUser(savedFrontendUser);
      setOriginalUser(JSON.parse(JSON.stringify(savedFrontendUser))); // Update original
      setPromotions(savedBackendData.EnrollforPromotions);
      setOriginalPromotions(savedBackendData.EnrollforPromotions);

      setIsEditing(false);
      alert("Profile saved successfully!");

    } catch (err) {
      alert(`Error saving: ${err.message}`);
    }
  };


  // --- Render logic (no changes, but now it works) ---
  if (loading) {
    return <div className="profile-container">Loading profile...</div>;
  }

  if (error) {
    return <div className="profile-container">Error: {error}</div>;
  }

  if (!user) {
    return <div className="profile-container">Could not load user profile.</div>;
  }

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
            <button onClick={handleSaveClick}>Save</button>
            {/* Add this button */}
            <button onClick={handleCancelClick} className="cancel-button">
              Cancel
            </button>
          </div>
        </div>
        
      )}
    </div>
  );
}
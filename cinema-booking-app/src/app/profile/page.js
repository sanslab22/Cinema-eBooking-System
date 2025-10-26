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
    // Don't fetch if we don't know who the user is
    if (!authUser) {
      setLoading(false);
      setError("You must be logged in to view this page.");
      return; 
    }

    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        // HERE IS THE DYNAMIC URL:
        const response = await fetch(`http://localhost:3001/api/users/${authUser.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const backendData = await response.json();

        // Transform backend data to fit frontend state
        const billingAddress = backendData.addresses[0] || {
          street: "", apt: "", city: "", state: "", zip: "",
        };
        const frontendUser = {
          firstName: backendData.firstName,
          lastName: backendData.lastName,
          email: backendData.email,
          billingAddress: billingAddress,
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
  }, [authUser]); // Re-run this if the logged-in user changes

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

  // 4. ADD HANDLERS FOR EDIT/SAVE/CANCEL
  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    // Revert changes from the stored original state
    setUser(originalUser);
    setPromotions(originalPromotions);
    setIsEditing(false);
  };

  const handleSaveClick = async () => {
    if (!authUser) { 
      alert("No user logged in.");
      return;
    }
    try {
      // Transform frontend state BACK to backend format
      const backendPayload = {
        firstName: user.firstName,
        lastName: user.lastName,
        EnrollforPromotions: promotions,
        addresses: [user.billingAddress], // Put single address object into an array
        paymentCards: user.paymentCards,
      };

      // Only send password if the user entered a new one
      if (user.password && user.password !== "") {
        backendPayload.password = user.password;
      }

      // HERE IS THE DYNAMIC SAVE URL:
      const response = await fetch(`http://localhost:3001/api/users/${authUser.id}`, {
        method: 'PUT', // Or 'PATCH'
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendPayload),
      });

      if (!response.ok) {
        throw new Error('Failed to save profile');
      }
      
      const savedBackendData = await response.json();

      // Re-transform the saved data to update our state
      const billingAddress = savedBackendData.addresses[0] || { street: "", apt: "", city: "", state: "", zip: "" };
      const savedFrontendUser = {
        firstName: savedBackendData.firstName,
        lastName: savedBackendData.lastName,
        email: savedBackendData.email,
        billingAddress: billingAddress,
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


  // 5. ADD LOADING/ERROR HANDLING
  if (loading) {
    return <div className="profile-container">Loading profile...</div>;
  }

  if (error) {
    return <div className="profile-container">Error: {error}</div>;
  }

  if (!user) {
    // This will show if authUser was null or if fetch failed
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
            <button onClick={toggleEdit}>Save</button>
          </div>
        </div>
      )}
    </div>
  );
}
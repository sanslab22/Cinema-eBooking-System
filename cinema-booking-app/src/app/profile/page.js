'use client'
import React, { useState, useEffect } from "react";
import "./page.css";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

export default function EditProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [promotions, setPromotions] = useState(false); // Will be set by fetch
  const [user, setUser] = useState(null); // Start with null

  // States for loading, errors, and cancellation
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [originalUser, setOriginalUser] = useState(null);
  const [originalPromotions, setOriginalPromotions] = useState(false);

  // --- NEW STATE for Password Reset ---
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [passwordFields, setPasswordFields] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  // --- END NEW STATE ---

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
        // This will become "http://localhost:3002/api/users/4"
        const response = await fetch(`http://localhost:3002/api/users/${userId}`);


        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const backendData = await response.json();

        // Transform backend data to fit frontend state
        // Use home address (addressTypeId: 1)
        const homeAddress = backendData.addresses.find(addr => addr.addressTypeId === 1) || {
          street: "", apt: "", city: "", state: "", zipCode: "",
        };

        // Clear cardNo (hashed) but keep maskedCardNo for display
       const paymentCards = (backendData.paymentCards || []).map(card => ({
          ...card,
          cardNo: card.maskedCardNo ? `•••• ${card.maskedCardNo}` : "",
        }));

        const frontendUser = {
          firstName: backendData.firstName,
          lastName: backendData.lastName,
          email: backendData.email,
          // Set billingAddress to be the homeAddress, ensuring zipCode is used
          billingAddress: homeAddress,
          paymentCards,
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
        updated.billingAddress[subfield] = e.target.value; // This is for the main home address
      } else if (field === "paymentCards") {
        // Check if we are updating the card's billing address
        if (subfield === 'street' || subfield === 'city' || subfield === 'state' || subfield === 'zipCode') {
          if (!updated.paymentCards[index].billingAddress) {
            updated.paymentCards[index].billingAddress = { street: "", city: "", state: "", zipCode: "" };
          }
          updated.paymentCards[index].billingAddress[subfield] = e.target.value;
        } else {
          // It's a direct property of the card
          updated.paymentCards[index][subfield] = e.target.value;
        }
      }
      setUser(updated);

    } else {
      setUser({ ...user, [field]: e.target.value });
    }
  };

  // --- NEW: Helper functions for password fields ---
  const handlePasswordChange = (e, field) => {
    setPasswordFields({
      ...passwordFields,
      [field]: e.target.value,
    });
  };

  const handleCancelPasswordReset = () => {
    setIsResettingPassword(false);
    setPasswordFields({ oldPassword: "", newPassword: "", confirmPassword: "" });
  };
  // --- END NEW ---


  const toggleEdit = () => setIsEditing(!isEditing);

  const handleAddCard = () => {
    // Note: Your backend supports 3, your frontend check says 4.
    if (user.paymentCards.length >= 3) {
      alert("You can only store up to 3 payment cards.");
      return;
    }
    setUser({
      ...user,
      paymentCards: [
        ...user.paymentCards,
        {
          cardNo: "", expirationDate: "",
          billingAddress: { street: "", city: "", state: "", zipCode: "" }
        }],
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
    handleCancelPasswordReset(); // Also reset password fields
    setIsEditing(false);
  };

  const sendEmail = async (email) => {
    try {
      const docRef = await addDoc(collection(db, "mail"), {
        to: [email],
        message: {
          subject: `Cinema E-Booking: Profile Updated`,
          html: `
            <p>Dear Customer,</p>
            <p>This email is to notify you that your profile has been updated.</p>
            <p>If you did not edit your profile, please email support and update your password.</p>
          `,
        },
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (error) {
      console.error("Error sending email:", error);
    }
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

    // --- NEW: Password Validation ---
    if (isResettingPassword) {
      const { oldPassword, newPassword, confirmPassword } = passwordFields;
      // Check if user started to fill fields but didn't complete
      if (oldPassword || newPassword || confirmPassword) {
        if (!oldPassword || !newPassword || !confirmPassword) {
          alert("To reset your password, you must fill in all three password fields.");
          return; // Stop the save
        }
        if (newPassword !== confirmPassword) {
          alert("New password and confirm password do not match.");
          return; // Stop the save
        }
      }
    }
    // --- END NEW VALIDATION ---

    try {
      // Prepare paymentCards for backend: send cardNo (plaintext), backend will hash and store maskedCardNo separately
      const backendPayload = {
        firstName: user.firstName,
        lastName: user.lastName,
        EnrollforPromotions: promotions,
        homeAddress: {
          street: user.billingAddress.street,
          city: user.billingAddress.city,
          state: user.billingAddress.state,
          zipCode: user.billingAddress.zipCode,
        },
        paymentCards: user.paymentCards.map(card => ({
          id: card.id, // keep id if exists, useful for updates
          cardNo: card.cardNo, // plaintext entered by user
          expirationDate: card.expirationDate,
          billingAddress: card.billingAddress || { street: "", city: "", state: "", zipCode: "" },
        })),
      };

      if (
        isResettingPassword &&
        passwordFields.oldPassword &&
        passwordFields.newPassword
      ) {
        // Assumes your backend expects 'oldPassword' and 'newPassword'
        backendPayload.oldPassword = passwordFields.oldPassword;
        backendPayload.newPassword = passwordFields.newPassword;
      }
      // --- END UPDATE ---

      // 3. Send the PUT request WITHOUT the Authorization header
      const response = await fetch(`http://localhost:3002/api/users/${userId}`, {
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
      const homeAddress = savedBackendData.addresses.find(addr => addr.addressTypeId === 1) || { street: "", apt: "", city: "", state: "", zipCode: "" };
      const savedFrontendUser = {
        firstName: savedBackendData.firstName,
        lastName: savedBackendData.lastName,
        email: savedBackendData.email,
        billingAddress: homeAddress,
        paymentCards: (savedBackendData.paymentCards || []).map(card => ({
          ...card,
          cardNo: "", // Clear hashed cardNo for editing
        })),
      };

      setUser(savedFrontendUser);
      setOriginalUser(JSON.parse(JSON.stringify(savedFrontendUser))); // Update original
      setPromotions(savedBackendData.EnrollforPromotions);
      setOriginalPromotions(savedBackendData.EnrollforPromotions);

      // --- UPDATED: Reset password fields on successful save ---
      handleCancelPasswordReset();
      setIsEditing(false);
      sendEmail(user.email);

    } catch (err) {
      console.log(err.message);
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
          <p><strong>Home Address:</strong> {user.billingAddress.street ? (`${user.billingAddress.street}${user.billingAddress.apt ? `, ${user.billingAddress.apt}` : ''}, ${user.billingAddress.city}, ${user.billingAddress.state} ${user.billingAddress.zipCode}`) : "N/A"}</p>
          <div>
            <strong>Payment Cards:</strong>
            <ul>
              {console.log(user)}
              {user.paymentCards.map((card) => (
                <li key={card.id}>
                  {card.maskedCardNo ? `•••• ${card.maskedCardNo}` : "•••• ****"} — ({card.expirationDate})
                </li>
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
          </div>

          {/* --- NEW: PASSWORD RESET SECTION --- */}
          <div className="form-section">
            <h3>Password</h3>
            {!isResettingPassword ? (
              <button onClick={() => setIsResettingPassword(true)}>
                Reset Password
              </button>
            ) : (
              <div className="password-reset-section">
                <input
                  type="password"
                  placeholder="Old Password"
                  value={passwordFields.oldPassword}
                  onChange={(e) => handlePasswordChange(e, "oldPassword")}
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={passwordFields.newPassword}
                  onChange={(e) => handlePasswordChange(e, "newPassword")}
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={passwordFields.confirmPassword}
                  onChange={(e) => handlePasswordChange(e, "confirmPassword")}
                />
                <button
                  type="button"
                  onClick={handleCancelPasswordReset}
                  className="cancel-button-small"
                >
                  Cancel Reset
                </button>
              </div>
            )}
          </div>
          {/* --- END NEW SECTION --- */}

          <div className="form-section">
            <h3>Home Address</h3>
            <input placeholder="Street" value={user.billingAddress.street} onChange={(e) => handleInputChange(e, "billingAddress", "street")} />
            <input placeholder="Apt #" value={user.billingAddress.apt} onChange={(e) => handleInputChange(e, "billingAddress", "apt")} />
            <input placeholder="City" value={user.billingAddress.city} onChange={(e) => handleInputChange(e, "billingAddress", "city")} />
            <input placeholder="State" value={user.billingAddress.state} onChange={(e) => handleInputChange(e, "billingAddress", "state")} />
            <input placeholder="Zip Code" value={user.billingAddress.zipCode} onChange={(e) => handleInputChange(e, "billingAddress", "zipCode")} />
          </div>

          <div className="form-section">
            <h3>Payment Cards</h3>
            {user.paymentCards.map((card, i) => (
              <div key={card.id || i} className="card-entry">
                <h4>Card #{i + 1}</h4>
                <input
                  placeholder="Card Number"
                  value={card.cardNo || ""}
                  onChange={(e) => handleInputChange(e, "paymentCards", "cardNo", i)}
                />
                <input
                  placeholder="Expiry (MM/YY)"
                  value={card.expirationDate}
                  onChange={(e) => handleInputChange(e, "paymentCards", "expirationDate", i)}
                />
                <input
                  placeholder="Billing Street"
                  value={card.billingAddress?.street || ''}
                  onChange={(e) => handleInputChange(e, "paymentCards", "street", i)}
                />
                <input
                  placeholder="Billing City"
                  value={card.billingAddress?.city || ''}
                  onChange={(e) => handleInputChange(e, "paymentCards", "city", i)}
                />
                <input
                  placeholder="Billing State"
                  value={card.billingAddress?.state || ''}
                  onChange={(e) => handleInputChange(e, "paymentCards", "state", i)}
                />
                <input
                  placeholder="Billing Zip Code"
                  value={card.billingAddress?.zipCode || ''}
                  onChange={(e) => handleInputChange(e, "paymentCards", "zipCode", i)}
                />
                <button onClick={() => handleRemoveCard(i)}>Remove</button>
              </div>
            ))}
            <button onClick={handleAddCard}>Add Card</button>
          </div>

          <div className="form-section promotions">
            <label>
              <input
              style={{display:"flex", alignItems:"center", justifyContent:"center", }}
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
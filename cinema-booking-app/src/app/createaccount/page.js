'use client'
import { Button } from "@mui/material";
import "./page.css";
import Link from "next/link";
import { useState, useEffect } from "react";

const CreateAccount = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    address: "",
    paymentCards: [
      { cardNumber: "", securityCode: "", expDate: "" },
      { cardNumber: "", securityCode: "", expDate: "" },
      { cardNumber: "", securityCode: "", expDate: "" },
    ],
    subscribe: false,
  });

  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCardChange = (index, e) => {
    const { name, value } = e.target;
    const cards = [...formData.paymentCards];
    cards[index][name] = value;
    setFormData((prev) => ({ ...prev, paymentCards: cards }));
  };

  const handleCreate = () => {
    setError(false);
    setErrorMessage("");

    const { username, password, confirmPassword, fullName } = formData;

    if (!username) {
      setError(true);
      setErrorMessage("Please enter a username");
    } else if (!password) {
      setError(true);
      setErrorMessage("Please enter a password");
    } else if (password.length < 8 || password.length > 16 || !/\d/.test(password) || !/[a-zA-Z]/.test(password) || !/[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/.test(password)){
      setError(true);
      setErrorMessage("Password must be 8-16 characters and include a number, a letter, and a special character.");
    } else if (password !== confirmPassword) {
      setError(true);
      setErrorMessage("Passwords do not match");
    } else if (!fullName) {
      setError(true);
      setErrorMessage("Please enter your full name");
    }
  };

  return (
    <div>
      <h1 className="title">Create Account</h1>
      <form>
        {error ? displayMessage(errorMessage) : null}
        <label>
          Username:
          <input type="text" name="username" required value={formData.username} onChange={handleChange}/>
        </label>
        <label>
          Full Name
          <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange}/>
        </label>
        <label>
          Password:
          <input type="password" name="password" required value={formData.password} onChange={handleChange}/>
        </label>
        <label>
          Confirm Password
          <input type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange}/>
        </label>
        <hr />
        <label>
          Home Address
          <input type="text" name="address" value={formData.address} onChange={handleChange}/>
        </label>
        <hr />
        {formData.paymentCards.map((card, index) => (
          <div key={index}>
            <h2 className="cardNum">Payment Card #{index + 1}</h2>
            <label>
              Card Number
              <input type="text" name="cardNumber" value={card.cardNumber} onChange={(e) => handleCardChange(index, e)} />
            </label>
            <div className="card-info">
              <label>
                Security Code
                <input type="text" name="securityCode" value={card.securityCode} onChange={(e) => handleCardChange(index, e)} />
              </label>
              <label>
                Expiration Date
                <input type="text" name="expDate" value={card.expDate} onChange={(e) => handleCardChange(index, e)} />
              </label>
            </div>
          </div>
        ))}

        <hr />

        <div className="checkbox-container">
          <p>Would you like to subscribe for promotions</p>
          <div>
            <input type="checkbox" name="subscribe" checked={formData.subscribe} onChange={handleChange} />
          </div>
        </div>
        <div className="button-container">
          <Button variant="contained" color="primary" onClick={handleCreate}>
            Create Account
          </Button>
        </div>
      </form>
    </div>
  );
};

const displayMessage = (errorMessage) => {
  return <div className="error-message">{errorMessage}</div>;
};

export default CreateAccount;

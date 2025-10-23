'use client'
import { Button } from "@mui/material";
import "./page.css";
import { useState } from "react";
import BackButton from "../components/BackButton";
import Link from "next/link";

const CreateAccount = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    paymentCards: [
      { cardNumber: "", securityCode: "", expDate: "" },
    ],
    subscribe: false,
  });

  const [step, setStep] = useState(1);
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

  const addCard = () => {
    if (formData.paymentCards.length < 3) {
      setFormData((prev) => ({
        ...prev,
        paymentCards: [...prev.paymentCards, { cardNumber: "", securityCode: "", expDate: "" }],
      }));
    }
  };

  const removeCard = (index) => {
    const cards = [...formData.paymentCards];
    // Don't allow removing the last card if it's the only one
    if (cards.length > 1) {
      cards.splice(index, 1);
      setFormData((prev) => ({ ...prev, paymentCards: cards }));
    }
  };

  const validateStep = () => {
    setError(false);
    setErrorMessage("");
    const { username, password, confirmPassword, fullName } = formData;

    switch (step) {
      case 1:
        if (!username) {
          setError(true);
          setErrorMessage("Please enter a username");
          return false;
        }
        if (!password) {
          setError(true);
          setErrorMessage("Please enter a password");
          return false;
        }
        if (password.length < 8 || password.length > 16 || !/\d/.test(password) || !/[a-zA-Z]/.test(password) || !/[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/.test(password)){
          setError(true);
          setErrorMessage("Password must be 8-16 characters and include a number, a letter, and a special character.");
          return false;
        }
        if (password !== confirmPassword) {
          setError(true);
          setErrorMessage("Passwords do not match");
          return false;
        }
        if (!fullName) {
          setError(true);
          setErrorMessage("Please enter your full name");
          return false;
        }
        return true;
      case 2:
        return true;
      case 3:
        return true;
      case 4:
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setStep((prevStep) => prevStep - 1);
    setError(false);
    setErrorMessage("");
  };

  const handleSubmit = () => {
    if (validateStep()) {
      console.log("Account created with data:", formData);
    }
  };

  return (
    <div>
      <BackButton route="/" />
      <h1 className="title">Create Account</h1>
      <form onSubmit={(e) => e.preventDefault()}>
        {error ? displayMessage(errorMessage) : null}

        {step === 1 && (
          <>
            <h2>Personal Information</h2>
            <label>
              Username:
              <input type="text" name="username" required value={formData.username} onChange={handleChange}/>
            </label>
            <label>
              Full Name:
              <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange}/>
            </label>
            <label>
              Password:
              <input type="password" name="password" required value={formData.password} onChange={handleChange}/>
            </label>
            <label>
              Confirm Password:
              <input type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange}/>
            </label>
            <div className="button-container">
              <Button variant="contained" color="primary" onClick={handleNext}>
                Next
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2>Home Address</h2>
            <label>
              Street
              <input type="text" name="address" value={formData.address} onChange={handleChange}/>
              <div>
                <label>
                  City
                  <input type="text" name="city" value={formData.city} onChange={handleChange}/>
                </label>
                <label>
                  State
                  <input type="text" name="state" value={formData.state} onChange={handleChange}/>
                </label>
                <label>
                  Zip Code
                  <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange}/>
                </label>
              </div>
            </label>
            <div className="button-container">
              <Button variant="contained" color="secondary" onClick={handleBack}>
                Back
              </Button>
              <Button variant="contained" color="primary" onClick={handleNext}>
                Next
              </Button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2>Payment Information</h2>
            <p>You can add up to 3 payment cards to be used in purchases.</p>
            <br />
            {formData.paymentCards.map((card, index) => (
              <div key={index}>
                <div className="card-header">
                  <h2 className="cardNum">Payment Card #{index + 1}</h2>
                  {formData.paymentCards.length > 1 && (
                     <Button variant="text" color="secondary" onClick={() => removeCard(index)}>
                       Remove
                     </Button>
                  )}
                </div>
                <br />
                <label>
                  Card Number:
                  <input type="text" name="cardNumber" value={card.cardNumber} onChange={(e) => handleCardChange(index, e)} />
                </label>
                <div className="card-info">
                  <label>
                    Security Code:
                    <input type="text" name="securityCode" value={card.securityCode} onChange={(e) => handleCardChange(index, e)} />
                  </label>
                  <label>
                    Expiration Date:
                    <input type="text" name="expDate" value={card.expDate} onChange={(e) => handleCardChange(index, e)} />
                  </label>
                </div>
              </div>
            ))}
            {formData.paymentCards.length < 3 && (
              <div className="add-card-container">
                <Button variant="contained" onClick={addCard}>+ Add another card</Button>
              </div>
            )}

            <div className="button-container">
              <Button variant="contained" color="secondary" onClick={handleBack}>
                Back
              </Button>
              <Button variant="contained" color="primary" onClick={handleNext}>
                Next
              </Button>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h2>Subscription</h2>
            <div className="checkbox-container">
              <p>Would you like to subscribe for promotions?</p>
              <div>
                <input type="checkbox" name="subscribe" checked={formData.subscribe} onChange={handleChange} />
              </div>
            </div>
            <div className="button-container">
              <Button variant="contained" color="secondary" onClick={handleBack}>
                Back
              </Button>
              <Button variant="contained" color="primary" onClick={handleSubmit}>
                Create Account
              </Button>
            </div>
          </>
        )}

        <br />

        <Link href="/login" style={{ textDecoration: "none" }}>
          <p>Have an account? Log in</p>
          </Link>
      </form>
    </div>
  );
};

const displayMessage = (errorMessage) => {
  return <div className="error-message">{errorMessage}</div>;
};

export default CreateAccount;

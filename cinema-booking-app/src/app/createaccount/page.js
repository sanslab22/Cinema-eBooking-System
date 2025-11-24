"use client";
import { Button } from "@mui/material";
import "./page.css";
import { useState } from "react";
import BackButton from "../components/BackButton";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

const CreateAccount = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    paymentCards: [{ cardNumber: "", securityCode: "", expDate: "" }],
    subscribe: false,
    code: "",
  });

  const [step, setStep] = useState(1);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [randomCode, setRandomCode] = useState(null);

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
        paymentCards: [
          ...prev.paymentCards,
          { cardNumber: "", securityCode: "", expDate: "" },
        ],
      }));
    }
  };

  const removeCard = (index) => {
    const cards = [...formData.paymentCards];
    cards.splice(index, 1);
    setFormData((prev) => ({ ...prev, paymentCards: cards }));
  };

  const validateStep = () => {
    setError(false);
    setErrorMessage("");
    const { email, password, confirmPassword, fullName } = formData;

    switch (step) {
      case 1:
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
          setError(true);
          setErrorMessage("Please enter a valid email");
          return false;
        }
        if (!password) {
          setError(true);
          setErrorMessage("Please enter a password");
          return false;
        }
        if (
          password.length < 8 ||
          password.length > 16 ||
          !/\d/.test(password) ||
          !/[a-zA-Z]/.test(password) ||
          !/[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/.test(password)
        ) {
          setError(true);
          setErrorMessage(
            "Password must be 8-16 characters and include a number, a letter, and a special character."
          );
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

  const handleNext = async () => {
    if (!validateStep()) {
      return;
    }

    if (step === 1) {
      const emailExists = await checkEmailExists(formData.email);
      if (emailExists) {
        setError(true);
        setErrorMessage("An account with this email already exists.");
        return;
      }
    }
    setStep((prevStep) => prevStep + 1);
  };

   const handleBack = () => {

    setStep((prevStep) => prevStep - 1);

    setError(false);

    setErrorMessage("");

  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    // Register user first
    try {
      // Prepare payload as before
      const nameParts = formData.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Check that all home address fields are filled (none are empty)
      const isHomeAddressComplete =
        formData.address.trim() !== "" &&
        formData.city.trim() !== "" &&
        formData.state.trim() !== "" &&
        formData.zipCode.trim() !== "";

      // Only include homeAddress if all fields are complete
      const homeAddress = isHomeAddressComplete
        ? {
            street: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
          }
        : undefined;

      const paymentCards = formData.paymentCards
        .filter(card => card.cardNumber && card.expDate)
        .map(card => {
          // card.expDate is "YYYY-MM" (e.g., "2024-05")
          const [year, month] = card.expDate.split('-'); 
          
          // Take the last 2 digits of the year
          const shortYear = year.slice(-2); 
          
          // Combine to create "MM/YY" (e.g., "05/24")
          const formattedDate = `${month}/${shortYear}`;

          return {
            cardNo: card.cardNumber,
            expirationDate: formattedDate, // Send the formatted date
            billingAddress: isHomeAddressComplete ? homeAddress : undefined,
          };
        });

      const payload = {
        email: formData.email,
        firstName,
        lastName,
        password: formData.password,
        ...(homeAddress && { homeAddress }),
        paymentCards,
        enrollForPromotions: formData.subscribe,
      };

      const response = await fetch('http://localhost:3002/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(true);
        setErrorMessage(errorData.message || 'Failed to create account.');
        return;
      }


      // After successful backend registration, generate the verification code
      const generatedCode = Math.floor(100000 + Math.random() * 900000);
      setRandomCode(generatedCode);

      // Send the verification email via Firebase Firestore
      try {
        const docRef = await addDoc(collection(db, "mail"), {
          to: [formData.email],
          message: {
            subject: `Cinema E-Booking: One-Time Code to Verify Account`,
            html: `
              <p>Dear Customer,</p>
              <p>Here is your one-time password to verify your account:</p>
              <p><b>${generatedCode}</b></p>
              <p>If you did not create an account, please ignore this email.</p>
            `,
          },
        });
        console.log("Verification email sent with ID:", docRef.id);
      } catch (error) {
        console.error("Error sending verification email:", error);
        setError(true);
        setErrorMessage("Failed to send verification email.");
        return;
      }

      // Move to verification step after registration and email sent
      handleNext();

    } catch (error) {
      setError(true);
      setErrorMessage("An unexpected error occurred during registration.");
    }
  };

  const verifyAccount = async () => {
    // Check if verification code matches the one generated and stored in state
    if (formData.code !== randomCode?.toString()) {
      setError(true);
      setErrorMessage("Invalid code");
      return;
    }

    try {
      // Call your backend endpoint that updates user status to 2 (active)
      const response = await fetch('http://localhost:3002/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(true);
        setErrorMessage(errorData.message || "Failed to verify account.");
        return;
      }


      if (redirectUrl) {
        // Case A: Came from booking -> Go to Login -> Login sends to Checkout
        router.push(`/login?redirect=${redirectUrl}`);
      } else {
        // Case B: Came from home -> Go to Login -> Login sends to Home
        router.push('/login');
      }
    } catch (error) {
      setError(true);
      setErrorMessage("An unexpected error occurred during verification.");
    }
  };

  const checkEmailExists = async (curr) => {
    try {
      const response = await fetch('http://localhost:3002/api/auth/check-email-exists', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: curr,
          }),
        });
        const data = await response.json();
        return data.exists;
        } catch (error) {
        console.error("Error checking email:", error);
        return false;
      }
    }

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
              Full Name: *
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
              />
            </label>
            <label>
              Email: *
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </label>
            <label>
              Password: *
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
              />
            </label>
            <label>
              Confirm Password: *
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
              />
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
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
              <div>
                <label>
                  City
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  State
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  Zip Code
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                  />
                </label>
              </div>
            </label>
            <div className="button-container">
              <Button
                variant="contained"
                color="secondary"
                onClick={handleBack}
              >
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
                    <Button
                      variant="text"
                      color="secondary"
                      onClick={() => removeCard(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <br />
                <label>
                  Card Number:
                  <input
                    type="text"
                    name="cardNumber"
                    value={card.cardNumber}
                    onChange={(e) => handleCardChange(index, e)}
                  />
                </label>
                <div className="card-info">
                  <label>
                    Security Code:
                    <input
                      type="text"
                      name="securityCode"
                      value={card.securityCode}
                      onChange={(e) => handleCardChange(index, e)}
                    />
                  </label>
                  <label>
                    Expiration Date:
                    <input
                      type="month"
                      name="expDate"
                      value={card.expDate}
                      onChange={(e) => handleCardChange(index, e)}
                      min={new Date().toISOString().slice(0, 7)}
                    />
                  </label>
                </div>
              </div>
            ))}
            {formData.paymentCards.length < 3 && (
              <div className="add-card-container">
                <Button variant="contained" onClick={addCard}>
                  + Add another card
                </Button>
              </div>
            )}

            <div className="button-container">
              <Button
                variant="contained"
                color="secondary"
                onClick={handleBack}
              >
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
                <input
                  type="checkbox"
                  name="subscribe"
                  checked={formData.subscribe}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="button-container">
              <Button
                variant="contained"
                color="secondary"
                onClick={handleBack}
              >
                Back
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
              >
                Create Account
              </Button>
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <h2>Account Verification</h2>
              <p>We sent you a verification code to your email: {formData.email}. Enter the code:</p>
              <br />
              <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                  style={{width: "50%", textAlign: "center", margin: "0 auto"}}
                />
            </div>
            <div className="button-container">
              <Button
                variant="contained"
                color="primary"
                onClick={verifyAccount}
              >
                Verify
              </Button>
            </div>
          </>
        )}

        <br />

        <Link href="/login" style={{ textDecoration: "none" }}>
          <p className="links">Have an account? Log in</p>
        </Link>
      </form>
    </div>
  );
};

const displayMessage = (errorMessage) => {
  return <div className="error-message">{errorMessage}</div>;
};

export default CreateAccount;

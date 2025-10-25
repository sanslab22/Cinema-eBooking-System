"use client";
import { Button } from "@mui/material";
import "./page.css";
import Link from "next/link";
import { useState, useEffect } from "react";
import BackButton from "../components/BackButton";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [step, setStep] = useState(1);
  const [oneTimeCode, setOneTimeCode] = useState(null);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleCodeChange = (e) => {
    setCode(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  const handlePasswordReset = () => {
    if (!password) {
      setError(true);
      setErrorMessage("Please enter a password");
    } else if (!newPassword) {
      setError(true);
      setErrorMessage("Please re-enter your password");
    } else if (password == newPassword) {
      resetPassword();
    } else {
      setError(true);
      setErrorMessage("Passwords don't match");
    }
  };

  const sendEmail = async () => {
    const generatedCode = Math.floor(100000 + Math.random() * 900000);
    setOneTimeCode(generatedCode);
    try {
      const docRef = await addDoc(collection(db, "mail"), {
        to: [email],
        message: {
          subject: `Cinema E-Booking: One-Time Code to Reset Password`,
          html: `
          <p>Dear Customer,</p>
          <p>Here is your one-time password to reset your password:</p>
          <p><b>${generatedCode}</b></p>
          <p>If you did not request a password reset, please ignore this email.</p>
        `,
        },
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };

  const resetPassword = async () => {
    try {
    } catch (error) {
      console.error("Error resetting password:", error);
    }
  };

  return (
    <div>
      <BackButton route="/login" />
      <h1 className="title">Reset Password</h1>
      {step == 1 ? (
        <div>
          <p>We will send you a one-time code to reset your password.</p>
          <form>
            {error ? displayMessage(errorMessage) : null}
            <label>
              Enter the email associated with your account
              <input
                type="text"
                name="email"
                required
                onChange={handleEmailChange}
              />
            </label>

            <div className="button-container">
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  sendEmail();
                  setStep(2);
                }}
              >
                Send Code
              </Button>
            </div>
          </form>
        </div>
      ) : step == 2 ? (
        <div>
          <form>
            {error ? displayMessage(errorMessage) : null}
            <label>
              Enter the one-time code to verify account
              <input
                type="text"
                name="code"
                required
                onChange={handleCodeChange}
              />
            </label>

            <div className="button-container">
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  if (code === oneTimeCode.toString()) {
                    setStep(3);
                  } else {
                    setError(true);
                    setErrorMessage("Invalid code");
                  }
                }}
              >
                Verify
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div>
          <form>
            {error ? displayMessage(errorMessage) : null}
            <label>
              New Password
              <input
                type="password"
                name="password"
                required
                onChange={handlePasswordChange}
              />
            </label>
            <label>
              Confirm Password
              <input
                type="password"
                name="newPassword"
                required
                onChange={handleNewPasswordChange}
              />
            </label>

            <div className="button-container">
              <Button
                variant="contained"
                color="primary"
                onClick={() => handlePasswordReset()}
              >
                Change Password
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

const displayMessage = (errorMessage) => {
  return <div className="error-message">{errorMessage}</div>;
};

export default ForgotPassword;

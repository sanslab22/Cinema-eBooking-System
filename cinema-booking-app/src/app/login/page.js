"use client";
import { Button } from "@mui/material";
import "./page.css";
import Link from "next/link";
import { useState, useEffect } from "react";
import BackButton from "../components/BackButton";
import { useRouter } from "next/navigation"; // 1. Import useRouter
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import withAuth from "../hoc/withAuth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState(null);


  const router = useRouter();

  // 4. Make handleLogin async and accept the event 'e'
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(false);
    setErrorMessage("");
    setNeedsVerification(false);

    if (!email || !password) {
      setError(true);
      setErrorMessage("Please enter an email and password");
      return;
    }

    try {
      const response = await fetch('http://localhost:3002/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If server says user not verified, handle resend code
        if (data.message && data.message.toLowerCase().includes("not verified")) {
          // Generate new code
          const newCode = Math.floor(100000 + Math.random() * 900000);
          setGeneratedCode(newCode);
          setNeedsVerification(true);

          // Send verification code via Firebase Firestore mail
          try {
            await addDoc(collection(db, "mail"), {
              to: [email],
              message: {
                subject: 'Cinema E-Booking: One-Time Code to Verify Account',
                html: `<p>Dear Customer,</p><p>Your verification code is: <b>${newCode}</b></p>`,
              },
            });
            setErrorMessage("Your account is not verified. A new code was sent to your email.");
          } catch (err) {
            setErrorMessage("Failed to send verification email. Please try again.");
          }
          return;
        }

        throw new Error(data.message || 'Failed to login');
      }

      // Regular successful login flow as you have
      if (!data.user || !data.user.id) throw new Error("Incomplete user data.");

      localStorage.setItem("userId", data.user.id.toString());
      localStorage.setItem("userType", data.user.userTypeId.toString());

      if (data.user.userTypeId === 1) {
        alert("Admin login successful. Redirecting...");
        window.location.href = '/admin-home';
      } else {
        alert("Login successful. Redirecting...");
        window.location.href = '/';
      }

    } catch (err) {
      setError(true);
      setErrorMessage(err.message);
    }
};

  const handleVerifyCode = async () => {
    if (verificationCode !== generatedCode?.toString()) {
      setError(true);
      setErrorMessage("Invalid verification code.");
      return;
    }
    try {
      const response = await fetch('http://localhost:3002/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(true);
        setErrorMessage(data.message || "Verification failed.");
        return;
      }

      alert("Verification successful. You can now log in.");
      setNeedsVerification(false);
      setVerificationCode("");
      setGeneratedCode(null);

    } catch (error) {
      setError(true);
      setErrorMessage("An unexpected error occurred during verification.");
    }
  };



  return (
    <div>
      <BackButton route="/" />
      <h1 className="title">Login</h1>
      <form onSubmit={handleLogin}>
        {error ? displayMessage(errorMessage) : null}
        <label>
          Email
          <input
            type="email" // Changed to 'email' for better semantics
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {needsVerification && (
          <>
            <label>
              We sent you a verification code to your email. Enter the code:
              <input
                type="text"
                value={verificationCode}
                onChange={e => setVerificationCode(e.target.value)}
              />
            </label>
            <Button variant="contained" color="primary" onClick={handleVerifyCode}>
              Verify
            </Button>
          </>
        )}

        <div className="button-container">
          <Button variant="contained" color="primary" type="submit">
            Login
          </Button>
        </div>

        <div className="links-container">
          <Link href="/createaccount" style={{ textDecoration: "none" }}>
            <p className="links"> New user? Create an Account</p>{" "}
          </Link>
          <Link href="/forgot-password" style={{ textDecoration: "none" }}>
            <p className="links">Forgot Password?</p>
          </Link>
        </div>
      </form>
    </div>
  );
};

const displayMessage = (errorMessage) => {
  return <div className="error-message">{errorMessage}</div>;
};

export default withAuth(Login, [0]);
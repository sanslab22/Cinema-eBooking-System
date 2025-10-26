"use client";
import { Button } from "@mui/material";
import "./page.css";
import Link from "next/link";
import { useState, useEffect } from "react";
import BackButton from "../components/BackButton";
import { useRouter } from "next/navigation"; // 1. Import useRouter

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();

  // 4. Make handleLogin async and accept the event 'e'
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent form from reloading the page
    setError(false);
    setErrorMessage("");

    // 5. Check if states (not form fields) are empty
    if (!email || !password) {
      setError(true);
      setErrorMessage("Please enter an email and password");
      return; // Stop execution
          }
    // 6. Add the fetch logic
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }), // Use state variables
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to login');
      }

      if (!data.user || !data.user.id) {
        throw new Error('Login successful, but no user ID was returned.');
      }
      
      // 7. Save the ID to localStorage
      localStorage.setItem('userId', data.user.id);
      
      // 8. Redirect to profile page
      router.push('/profile'); // Or your profile page route

    } catch (err) {
      setError(true);
      setErrorMessage(err.message);
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

export default Login;

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
    e.preventDefault(); // Prevent default form submission
    setError(false);
    setErrorMessage("");

    if (!email || !password) {
      setError(true);
      setErrorMessage("Please enter an email and password");
      return;
    }

    try {
      // Your fetch call is perfect.
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to login');
      }

      if (!data.user || !data.user.id) {
        throw new Error("Login response is missing token or user ID.");
      }

      // on successful login, you might want to store user data in the profile page but i wanna get it from the database
      // Save *only* the token and ID
      localStorage.setItem("userId", data.user.id.toString()); // Save as string

      
      // On successful login, redirect to home page
      router.push('/'); // 5. Use router to navigate to home page



      // You can now use the token and ID in subsequent API calls
      // For example, fetch user profile data:
      // const userResponse = await fetch('http://localhost:3001/api/user/profile', {
      //   method: 'GET',
      //   headers: {
      //     'Authorization': `Bearer ${data.token}`,
      //   },
      // });



    }
    catch (err) {
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

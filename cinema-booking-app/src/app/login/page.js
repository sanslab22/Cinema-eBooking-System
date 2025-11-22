"use client";
import { Button } from "@mui/material";
import "./page.css";
import Link from "next/link";
import { useState, useEffect } from "react";
import BackButton from "../components/BackButton";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { login, isAuthenticated } = useAuth();

  const router = useRouter();

  useEffect(() => {
    // If the user is already authenticated, redirect them away from the login page.
    if (isAuthenticated) {
      router.push('/'); // Redirect to homepage or dashboard
    }
  }, [isAuthenticated, router]);

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
      // Call the login function from AuthContext.
      const user = await login(email, password);
      
      // On successful login, redirect based on userTypeId
      if (user.userTypeId === 1) {
        router.push('/admin-home');
      } else {
        router.push('/'); 
      }
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
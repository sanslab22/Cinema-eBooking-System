"use client";
import { Button } from "@mui/material";
import "./page.css";
import Link from "next/link";
import { useState, useEffect } from "react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = () => {
    if (username && password) {
      // Add logic for invalid username password
    } else {
      setError(true);
      setErrorMessage("Please enter a username and password");
    }
  };

  return (
    <div>
      <h1 className="title">Login</h1>
      <form>
        {error ? displayMessage(errorMessage) : null}
        <label>
          Username
          <input type="text" name="username" required />
        </label>
        <label>
          Password
          <input type="password" name="password" required />
        </label>

        <div className="button-container">
          <Button variant="contained" color="primary" onClick={handleLogin}>
            Login
          </Button>
        </div>

        <div className="links-container">
          <Link href="/createaccount" style={{ textDecoration: "none" }}>
            <p className="links"> New user? Create an Account</p>{" "}
          </Link>
          <Link href="/" style={{ textDecoration: "none" }}>
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

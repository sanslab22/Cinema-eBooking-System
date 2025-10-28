"use client";
import { Button } from "@mui/material";
import "./Navbar.css";
import Link from "next/link";
// RIGHT: Get navigation hooks from next/navigation
import { useRouter, usePathname } from "next/navigation";

// RIGHT: Get React hooks from 'react'
import React, { useState, useEffect } from "react";

const Navbar = () => {
  const router = useRouter();

  // 2. Get the current URL path
  const pathname = usePathname();

  // 2. Use state to track login status. Default to 'false' (not logged in).
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // We can also add admin state later if needed
  const [isAdmin, setIsAdmin] = useState(false);

  // 3. Update the useEffect hook
  useEffect(() => {
    // This effect will now re-run every time 'pathname' changes
    const userId = localStorage.getItem("userId"); 
    if (userId) {
      setIsLoggedIn(true);
      if (localStorage.getItem("userType") === "1") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } else {
      // 4. Add an 'else' block
      // This ensures you are logged out when you click "Logout"
      setIsLoggedIn(false);
    }
  }, [pathname]); // 5. Add 'pathname' as a dependency

  // 4. Create a function to handle logging out
  const handleLogout = async () => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      try {
        const response = await fetch('http://localhost:3002/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });
      } catch (err) {
        console.error("Failed to update user status on logout:", err);
      }
    }

    // Clear only the "userId" from localStorage
    localStorage.removeItem("userId");
    localStorage.removeItem("userType"); // <-- ADD THIS LINE
    setIsLoggedIn(false);
    setIsAdmin(false);
    
    // Redirect to the login page
    router.push("/login");
  };

  return (
    <div className="navbar">
      <Link href="/" style={{ textDecoration: "none", color: "white" }}>
        <h1>Cinema E-Booking App</h1>{" "}
      </Link>

      {/* 5. Check your state variable */}
      {!isLoggedIn ? (
        <div className="nav-buttons">
          <Link href="/createaccount" style={{ textDecoration: "none" }}>
            <p className="link">Register</p>
          </Link>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => router.push("/login")}
          >
            Login
          </Button>
        </div>
      ) : (
        !isAdmin ?
        <div className="nav-buttons-loggedin">
          <Link href="/orders" style={{ textDecoration: "none", color: "white" }}>
             <p>Orders</p>
          </Link>
          <Link href="/profile" style={{ textDecoration: "none", color: "white" }}>
             <p>Profile</p>
          </Link>
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={handleLogout} // 6. Call handleLogout on click
          >
            Logout
          </Button>
        </div>
        : (
        <div className="nav-buttons-loggedin-admin">
          <p>Movies</p>
          <p>Promotions</p>
          <p>Users</p>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {router.push("/login"); handleLogout();}}
          >
            Logout
          </Button>
        </div>
      ))}
    </div>
  );
};

export default Navbar;
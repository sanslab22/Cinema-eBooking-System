"use client";
import { Button } from "@mui/material";
import "./Navbar.css";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const router = useRouter();
  const notLoggedIn  = false;

  return (
    <div className="navbar">
      <Link href="/" style={{ textDecoration: "none", color: "white" }}>
        <h1>Cinema E-Booking App</h1>{" "}

      </Link>

      {notLoggedIn?
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
      :<div className="nav-buttons-loggedin">
        <p>Orders</p>
        
        <Button variant="contained"
          color="secondary"
          onClick={() => router.push("/profile")}
          className="profile-button"
        >Profile</Button>

        <Button variant="contained"
          color="secondary"
          onClick={() => router.push("/login")}>Logout</Button>
        </div>}
      
    </div>
  );
};

export default Navbar;

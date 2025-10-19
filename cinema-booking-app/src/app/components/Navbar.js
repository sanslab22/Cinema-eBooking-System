'use client'
import { Button } from "@mui/material";
import "./Navbar.css";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Navbar = () => {
    const router = useRouter();

    return (
        <div className="navbar">
            <h1>Cinema E-Booking App</h1>  
            <div className="nav-buttons">
                <Link href="/createaccount" style={{textDecoration:"none"}}>
                <p className="link">
                    Register
                </p>
                </Link>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => router.push("/login")}
                >
                    Login
                </Button>
            </div>
        </div>
    );
};

export default Navbar;
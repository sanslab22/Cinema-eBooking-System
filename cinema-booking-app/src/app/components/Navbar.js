import { Button } from "@mui/material";
import "./Navbar.css";

const Navbar = () => {
    return (
        <div className="navbar">
            <h1>Cinema E-Booking App</h1>  
            <div className="nav-buttons">
                <p>
                    Register
                </p>
                <Button
                    variant="contained"
                    color="secondary"
                >
                    Login
                </Button>
            </div>
        </div>
    );
};

export default Navbar;
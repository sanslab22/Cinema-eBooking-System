import { Button } from "@mui/material";
import "./page.css";
import Link from "next/link";


const Login = () => {
    return (
        <div>
            <h1 className="title">Login</h1>
            <form>
                <label>
                    Username
                    <input type="text" name="username" required />
                </label>
                <label>
                    Password
                    <input type="password" name="password" required />
                </label>

                <div className="button-container">
                    <Button variant="contained" color="primary">
                        Login
                    </Button>
                </div>

                <div className="links-container">
                    <Link
                    href="/createaccount"
                    style={{textDecoration:"none"}}
                    >
                       <p className="links"> New user? Create an Account</p> </Link>
                    <Link
                    href="/"
                    style={{textDecoration:"none"}}
                    ><p className="links">
                        Forgot Password?</p>
                    </Link>
                </div>
            </form>
        </div>
    )
}

export default Login;
import { Button } from "@mui/material";
import "./page.css";


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
            </form>
        </div>
    )
}

export default Login;
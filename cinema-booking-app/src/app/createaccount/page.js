import { Button } from "@mui/material";
import "./page.css";

const CreateAccount = () => {
  return (
    <div>
      <h1 className="title">Create Account</h1>
      <form>
        <label>
          Username:
          <input type="text" name="username" required />
        </label>
        <label>
          Full Name
          <input type="text" name="fullname" required />
        </label>
        <label>
          Password:
          <input type="password" name="password" required />
        </label>
        <label>
          Confirm Password
          <input type="password" name="confirmPassword" required />
        </label>
        <hr />
        <label>
          Home Address
          <input type="text" name="address" />
        </label>
        <hr />
        <h2 className="cardNum">Payment Card #1</h2>
        <label>
          Card Number
          <input type="text" name="cardNumber" />
        </label>
        <div className="card-info">
          <label>
            Security Code
            <input type="text" name="securityCode" />
          </label>
          <label>
            Expiration Date
            <input type="text" name="expDate" />
          </label>
        </div>

        <h2 className="cardNum">Payment Card #2</h2>
        <label>
          Card Number
          <input type="text" name="cardNumber" />
        </label>
        <div className="card-info">
          <label>
            Security Code
            <input type="text" name="securityCode" />
          </label>
          <label>
            Expiration Date
            <input type="text" name="expDate" />
          </label>
        </div>

        <h2 className="cardNum">Payment Card #3</h2>
        <label>
          Card Number
          <input type="text" name="cardNumber" />
        </label>
        <div className="card-info">
          <label>
            Security Code
            <input type="text" name="securityCode" />
          </label>
          <label>
            Expiration Date
            <input type="text" name="expDate" />
          </label>
        </div>
        <div className="button-container">
          <Button variant="contained" color="primary">
            Create Account
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateAccount;

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@mui/material";
import "./page.css";
import BookingTimer from "../components/BookingTimer"; // Import timer

const CheckoutPage = () => {
  const router = useRouter();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expiryTime, setExpiryTime] = useState(null);

  // Address State
  const [homeAddress, setHomeAddress] = useState({ street: "", city: "", state: "", zip: "" });
  const [paymentAddress, setPaymentAddress] = useState({ street: "", city: "", state: "", zip: "" });
  const [sameAsHome, setSameAsHome] = useState(false);

  // 1. Load Booking Data & Timer
  useEffect(() => {
    const bookingDataJSON = localStorage.getItem("bookingData");
    if (bookingDataJSON) {
      const { data, expiry } = JSON.parse(bookingDataJSON);
      if (new Date().getTime() < expiry) {
        setBooking(data);
        setExpiryTime(expiry);
      } else {
        localStorage.removeItem("bookingData");
        alert("Session expired.");
        router.push("/");
      }
    } else {
      router.push("/");
    }
    setLoading(false);
  }, [router]);

  // 2. Fetch User Profile for Auto-fill
  useEffect(() => {
    const fetchUserProfile = async () => {
      const userId = localStorage.getItem("userId");
      if (userId) {
        try {
          // Replace with your actual API endpoint
          // const res = await fetch(`http://localhost:3002/api/users/${userId}`);
          // const userData = await res.json();
          
          // MOCK DATA for demonstration (Delete this block when connecting API)
          const userData = {
            homeAddress: { street: "123 Main St", city: "Atlanta", state: "GA", zip: "30097" },
            // paymentAddress might be null in DB, or same
          };

          if (userData.homeAddress) {
            setHomeAddress(userData.homeAddress);
          }
          // Pre-fill payment address if it exists, or leave empty
          if (userData.paymentAddress) {
            setPaymentAddress(userData.paymentAddress);
          }

        } catch (err) {
          console.error("Failed to load user profile", err);
        }
      }
    };
    fetchUserProfile();
  }, []);

  const handleConfirmPayment = () => {
    // Validate addresses here if needed
    if(!homeAddress.street || !paymentAddress.street) {
        alert("Please fill in all address fields");
        return;
    }

    alert("Payment Successful! Enjoy the movie.");
    localStorage.removeItem("bookingData");
    router.push("/"); 
  };

  const handleSameAsHomeChange = (e) => {
    setSameAsHome(e.target.checked);
    if (e.target.checked) {
      setPaymentAddress({ ...homeAddress });
    } else {
      setPaymentAddress({ street: "", city: "", state: "", zip: "" });
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!booking) return null;

  // Calculate Total
  const total = (booking.childrenTicket * 10) + (booking.adultTicket * 15) + (booking.seniorTicket * 12);

  return (
    <div className="checkout-container">
      {/* Timer persists here */}
      {expiryTime && <BookingTimer expiryTimestamp={expiryTime} />}

      <h1>Checkout</h1>
      
      <div className="checkout-grid">
        {/* LEFT COLUMN: FORMS */}
        <div className="forms-section">
            
            {/* Home Address */}
            <div className="form-card">
                <h3>Home Address</h3>
                <input type="text" placeholder="Street" value={homeAddress.street} onChange={e => setHomeAddress({...homeAddress, street: e.target.value})} className="input-field" />
                <div className="row">
                    <input type="text" placeholder="City" value={homeAddress.city} onChange={e => setHomeAddress({...homeAddress, city: e.target.value})} className="input-field" />
                    <input type="text" placeholder="State" value={homeAddress.state} onChange={e => setHomeAddress({...homeAddress, state: e.target.value})} className="input-field" />
                    <input type="text" placeholder="Zip" value={homeAddress.zip} onChange={e => setHomeAddress({...homeAddress, zip: e.target.value})} className="input-field" />
                </div>
            </div>

            {/* Payment Address */}
            <div className="form-card">
                <h3>Payment Address</h3>
                <label style={{display:'block', marginBottom:'10px'}}>
                    <input type="checkbox" checked={sameAsHome} onChange={handleSameAsHomeChange} /> Same as Home Address
                </label>
                
                <input type="text" placeholder="Street" value={paymentAddress.street} onChange={e => setPaymentAddress({...paymentAddress, street: e.target.value})} className="input-field" disabled={sameAsHome} />
                <div className="row">
                    <input type="text" placeholder="City" value={paymentAddress.city} onChange={e => setPaymentAddress({...paymentAddress, city: e.target.value})} className="input-field" disabled={sameAsHome} />
                    <input type="text" placeholder="State" value={paymentAddress.state} onChange={e => setPaymentAddress({...paymentAddress, state: e.target.value})} className="input-field" disabled={sameAsHome} />
                    <input type="text" placeholder="Zip" value={paymentAddress.zip} onChange={e => setPaymentAddress({...paymentAddress, zip: e.target.value})} className="input-field" disabled={sameAsHome} />
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN: RECEIPT */}
        <div className="receipt-card">
          <div className="receipt-header"><h2>Order Summary</h2></div>
          <div className="receipt-body">
            <div className="receipt-row"><strong>Movie:</strong><span>{booking.movieTitle}</span></div>
            <div className="receipt-row"><strong>Seats:</strong><span>{booking.seatsSelected.join(", ")}</span></div>
            <hr />
            <div className="receipt-row total-row"><strong>Total:</strong><strong>${total.toFixed(2)}</strong></div>
          </div>
          <div className="receipt-footer">
            <Button variant="contained" color="primary" fullWidth onClick={handleConfirmPayment}>
                Pay Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
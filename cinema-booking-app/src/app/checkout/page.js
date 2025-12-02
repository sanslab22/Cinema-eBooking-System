"use client";
import withAuth from "../hoc/withAuth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Grid, TextField, Checkbox, FormControlLabel, Divider, Paper } from "@mui/material";
import "./page.css";
import BookingTimer from "../components/BookingTimer";

const CheckoutPage = () => {
  const router = useRouter();
  
  // Data States
  const [booking, setBooking] = useState(null);
  const [ticketPrices, setTicketPrices] = useState(null); // <--- NEW: Stores DB prices
  const [loading, setLoading] = useState(true);
  const [pricesLoading, setPricesLoading] = useState(true);
  const [expiryTime, setExpiryTime] = useState(null);

  // Form States
  const [homeAddress, setHomeAddress] = useState({ street: "", city: "", state: "", zip: "" });
  const [paymentAddress, setPaymentAddress] = useState({ street: "", city: "", state: "", zip: "" });
  const [sameAsHome, setSameAsHome] = useState(false);
  const [cardDetails, setCardDetails] = useState({ number: "", exp: "", name: "" });
  const [promoCode, setPromoCode] = useState("");

  // 1. Load Booking Data from LocalStorage
  useEffect(() => {
    const bookingDataJSON = localStorage.getItem("bookingData");
    if (bookingDataJSON) {
      const { data, expiry } = JSON.parse(bookingDataJSON);
      if (new Date().getTime() < expiry) {
        setBooking(data);
        setExpiryTime(expiry);
      } else {
        localStorage.removeItem("bookingData");
        router.push("/");
      }
    } else {
      router.push("/");
    }
    setLoading(false);
  }, [router]);

  // 2. Fetch User Profile & Auto-fill Data
  useEffect(() => {
    const fetchUserProfile = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      try {
        // Update URL if your backend runs on a different port
        const res = await fetch(`http://localhost:3002/api/users/${userId}`);
        
        if (!res.ok) {
            throw new Error("Failed to fetch user profile");
        }

        const userData = await res.json();
        
        const backendHome = userData.addresses?.find(addr => addr.addressTypeId === 1);
        
        if (backendHome) {
            setHomeAddress({
                street: backendHome.street || "",
                city: backendHome.city || "",
                state: backendHome.state || "",
                // Database usually says 'zipCode', Frontend state expects 'zip'
                zip: backendHome.zipCode || backendHome.zip || "" 
            });
        }
      
        if (userData.paymentCards && userData.paymentCards.length > 0) {
            const savedCard = userData.paymentCards[0];
            
            setCardDetails({
                
                number: savedCard.cardNum || savedCard.number || "**** **** **** ****", 
                exp: savedCard.expirationDate || "", 
                
                name: savedCard.nameOnCard || `${userData.firstName} ${userData.lastName}`
            });

            
            if (savedCard.billingAddress) {
                setPaymentAddress({
                    street: savedCard.billingAddress.street || "",
                    city: savedCard.billingAddress.city || "",
                    state: savedCard.billingAddress.state || "",
                    zip: savedCard.billingAddress.zipCode || savedCard.billingAddress.zip || ""
                });
                
               
                if (backendHome && savedCard.billingAddress.street === backendHome.street) {
                    setSameAsHome(true);
                }
            }
        }

      } catch (err) {
        console.error("Failed to load user profile", err);
      }
    };
    
    fetchUserProfile();
  }, []);

  // 3. REAL: Fetch Prices from Database
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch("http://localhost:3002/api/admin/tickets");
        
        if (!res.ok) {
            throw new Error("Failed to fetch ticket prices");
        }

        const data = await res.json(); 
        const priceMap = {};
        data.forEach((ticket) => {
            priceMap[ticket.category] = ticket.price;
        });

        setTicketPrices(priceMap);
      } catch (error) {
        console.error("Error fetching prices:", error);
        // Fallback or error handling if DB fails
        alert("Could not load latest prices.");
      } finally {
        setPricesLoading(false);
      }
    };

    fetchPrices();
  }, []);


  // --- HANDLERS ---
  const handleSameAsHomeChange = (e) => {
    setSameAsHome(e.target.checked);
    if (e.target.checked) {
      setPaymentAddress({ ...homeAddress });
    } else {
      setPaymentAddress({ street: "", city: "", state: "", zip: "" });
    }
  };

  const handleConfirmPayment = () => {
    if (!cardDetails.number || !homeAddress.street) {
      alert("Please complete all fields.");
      return;
    }
    // Final Logic: Send total + booking data to backend
    alert("Payment Successful!");
    localStorage.removeItem("bookingData");
    router.push("/");
  };

  // --- CALCULATION LOGIC ---
  // Returns { total: 0, items: [] }
  const getOrderDetails = () => {
    if (!booking || !ticketPrices) return { total: 0, items: [] };

    const counts = booking.ticketCounts || {}; 
    let total = 0;
    const items = [];

    // Loop through the ticket types in localStorage (e.g., "Child", "Adult")
    Object.keys(counts).forEach((type) => {
        const count = counts[type];
        const price = ticketPrices[type] || 0; // Matches DB price
        
        if (count > 0) {
            const subtotal = count * price;
            total += subtotal;
            items.push({ type, count, price, subtotal });
        }
    });

    return { total, items };
  };

  if (loading) return <div>Loading...</div>;
  if (!booking) return null;

  const { total, items } = getOrderDetails();

  return (
    <div className="checkout-page-wrapper">
      
      <h1 className="checkout-title">Checkout</h1>

      {expiryTime && (
        <div style={{ marginBottom: '10px', width: '100%' }}>
            <BookingTimer expiryTimestamp={expiryTime} />
        </div>
      )}

      <Grid container spacing={24}>
        
        {/* --- LEFT COLUMN: ADDRESSES --- */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} className="section-card">
            <h2 className="section-header">Billing & Shipping</h2>
            
            <h3 className="sub-header">Home Address</h3>
            <TextField fullWidth label="Street Address" variant="outlined" size="small" margin="normal"
              value={homeAddress.street} onChange={e => setHomeAddress({ ...homeAddress, street: e.target.value })} />
            <Grid container spacing={2}>
              <Grid item xs={6}><TextField fullWidth label="City" size="small" margin="normal" value={homeAddress.city} onChange={e => setHomeAddress({ ...homeAddress, city: e.target.value })} /></Grid>
              <Grid item xs={3}><TextField fullWidth label="State" size="small" margin="normal" value={homeAddress.state} onChange={e => setHomeAddress({ ...homeAddress, state: e.target.value })} /></Grid>
              <Grid item xs={3}><TextField fullWidth label="Zip" size="small" margin="normal" value={homeAddress.zip} onChange={e => setHomeAddress({ ...homeAddress, zip: e.target.value })} /></Grid>
            </Grid>

            <Divider style={{ margin: '30px 0' }} />

            <h3 className="sub-header">Billing Address</h3>
            <FormControlLabel
              control={<Checkbox checked={sameAsHome} onChange={handleSameAsHomeChange} />}
              label="Same as Home Address"
              style={{marginBottom: '10px'}}
            />
            
            <div style={{ opacity: sameAsHome ? 0.5 : 1, transition: '0.3s' }}>
                <TextField fullWidth label="Street Address" size="small" margin="normal" disabled={sameAsHome}
                value={paymentAddress.street} onChange={e => setPaymentAddress({ ...paymentAddress, street: e.target.value })} />
                <Grid container spacing={2}>
                <Grid item xs={6}><TextField fullWidth label="City" size="small" margin="normal" disabled={sameAsHome} value={paymentAddress.city} onChange={e => setPaymentAddress({ ...paymentAddress, city: e.target.value })} /></Grid>
                <Grid item xs={3}><TextField fullWidth label="State" size="small" margin="normal" disabled={sameAsHome} value={paymentAddress.state} onChange={e => setPaymentAddress({ ...paymentAddress, state: e.target.value })} /></Grid>
                <Grid item xs={3}><TextField fullWidth label="Zip" size="small" margin="normal" disabled={sameAsHome} value={paymentAddress.zip} onChange={e => setPaymentAddress({ ...paymentAddress, zip: e.target.value })} /></Grid>
                </Grid>
            </div>
          </Paper>
        </Grid>

        {/* --- RIGHT COLUMN: SUMMARY --- */}
        <Grid item xs={12} md={4}>
            
            <div className="right-column-stack">
                
                {/* ORDER SUMMARY */}
                <Paper elevation={0} className="receipt-card">
                    <div className="receipt-header"><h3>Order Summary</h3></div>
                    <div className="receipt-content">
                        <div className="receipt-row main-info"><strong>Movie</strong> <span>{booking.movieTitle}</span></div>
                        <div className="receipt-row main-info"><strong>Seats</strong> <span>{booking.seatsSelected?.join(", ")}</span></div>
                        
                        <Divider style={{ margin: '15px 0', borderStyle: 'dashed' }} />
                        
                        {/* DYNAMIC ITEM ROWS */}
                        {pricesLoading ? (
                            <div style={{textAlign:'center', color:'#999'}}>Loading prices...</div>
                        ) : (
                            items.map((item) => (
                                <div className="receipt-row" key={item.type}>
                                    <span>{item.type} Ticket x {item.count}</span>
                                    <span>${item.subtotal.toFixed(2)}</span>
                                </div>
                            ))
                        )}

                        <div className="promo-box">
                            <TextField placeholder="Promo Code" size="small" fullWidth value={promoCode} onChange={(e) => setPromoCode(e.target.value)} InputProps={{ endAdornment: <Button style={{marginRight: '-10px'}}>Apply</Button> }} />
                        </div>
                    </div>
                    <div className="receipt-total">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </Paper>

                {/* PAYMENT DETAILS */}
                <Paper elevation={0} className="section-card payment-card">
                    <h3 className="sub-header">Payment Details</h3>
                    <TextField fullWidth label="Card Number" placeholder="0000 0000 0000 0000" margin="dense" size="small"
                        value={cardDetails.number} onChange={e => setCardDetails({ ...cardDetails, number: e.target.value })} />
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <TextField fullWidth label="Name" placeholder="John Doe" margin="dense" size="small"
                        value={cardDetails.name} onChange={e => setCardDetails({ ...cardDetails, name: e.target.value })} />
                        <TextField fullWidth label="Expiry" placeholder="MM/YY" margin="dense" size="small"
                        value={cardDetails.exp} onChange={e => setCardDetails({ ...cardDetails, exp: e.target.value })} />
                    </div>
                    <Button variant="contained" color="error" fullWidth size="large" style={{marginTop: '20px'}} onClick={handleConfirmPayment}>
                        Pay ${total.toFixed(2)}
                    </Button>
                </Paper>

            </div>
        </Grid>

      </Grid>
    </div>
  );
};

export default withAuth(CheckoutPage, [2]);
"use client";
import withAuth from "../hoc/withAuth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Grid,
  TextField,
  Checkbox,
  FormControlLabel,
  Divider,
  Paper,
} from "@mui/material";
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
  const [homeAddress, setHomeAddress] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
  });
  const [paymentAddress, setPaymentAddress] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
  });
  const [sameAsHome, setSameAsHome] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: "",
    exp: "",
    name: "",
  });
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [errors, setErrors] = useState({});

  const clearError = (field) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

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

        const backendHome = userData.addresses?.find(
          (addr) => addr.addressTypeId === 1
        );

        if (backendHome) {
          setHomeAddress({
            street: backendHome.street || "",
            city: backendHome.city || "",
            state: backendHome.state || "",
            // Database usually says 'zipCode', Frontend state expects 'zip'
            zip: backendHome.zipCode || backendHome.zip || "",
          });
        }

        if (userData.paymentCards && userData.paymentCards.length > 0) {
          const savedCard = userData.paymentCards[0];

          setCardDetails({
            number:
              savedCard.cardNum || savedCard.number || "**** **** **** ****",
            exp: savedCard.expirationDate || "",

            name:
              savedCard.nameOnCard ||
              `${userData.firstName} ${userData.lastName}`,
          });

          if (savedCard.billingAddress) {
            setPaymentAddress({
              street: savedCard.billingAddress.street || "",
              city: savedCard.billingAddress.city || "",
              state: savedCard.billingAddress.state || "",
              zip:
                savedCard.billingAddress.zipCode ||
                savedCard.billingAddress.zip ||
                "",
            });

            if (
              backendHome &&
              savedCard.billingAddress.street === backendHome.street
            ) {
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

  // If sameAsHome is true, keep paymentAddress in sync with homeAddress
  useEffect(() => {
    if (sameAsHome) {
      setPaymentAddress({ ...homeAddress });
    }
  }, [homeAddress, sameAsHome]);

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
      // Clear payment address errors since they are no longer required
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.paymentStreet;
        delete copy.paymentCity;
        delete copy.paymentState;
        delete copy.paymentZip;
        return copy;
      });
    } else {
      setPaymentAddress({ street: "", city: "", state: "", zip: "" });
    }
  };

  const handleConfirmPayment = () => {
    // Validate fields before processing payment
    if (!validateFields()) return;
    // Final Logic: Send total + booking data to backend
    alert("Payment Successful!");
    localStorage.removeItem("bookingData");
    router.push("/");
  };

  // Validate required fields. All fields required except promo code; when sameAsHome is true, billing address fields are not required
  const validateFields = () => {
    const newErrors = {};

    // Home address
    if (!homeAddress.street || !homeAddress.street.trim()) newErrors.homeStreet = "Street address is required.";
    if (!homeAddress.city || !homeAddress.city.trim()) newErrors.homeCity = "City is required.";
    if (!homeAddress.state || !homeAddress.state.trim()) newErrors.homeState = "State is required.";
    if (!homeAddress.zip || !homeAddress.zip.trim()) newErrors.homeZip = "Zip is required.";

    // Payment address (only required if not sameAsHome)
    if (!sameAsHome) {
      if (!paymentAddress.street || !paymentAddress.street.trim()) newErrors.paymentStreet = "Street address is required.";
      if (!paymentAddress.city || !paymentAddress.city.trim()) newErrors.paymentCity = "City is required.";
      if (!paymentAddress.state || !paymentAddress.state.trim()) newErrors.paymentState = "State is required.";
      if (!paymentAddress.zip || !paymentAddress.zip.trim()) newErrors.paymentZip = "Zip is required.";
    }

    // Card details
    if (!cardDetails.number || !cardDetails.number.trim()) newErrors.cardNumber = "Card number is required.";
    if (!cardDetails.name || !cardDetails.name.trim()) newErrors.cardName = "Name on card is required.";
    if (!cardDetails.exp || !cardDetails.exp.trim()) newErrors.cardExp = "Expiry date is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

 const applyPromotion = async (name = promoCode) => {
    try {
        setPromoError("");
        setAppliedPromo(null);
        if (!name || !name.trim()) {
          setPromoError("Please enter a promo code.");
          return;
        }
        const res = await fetch("http://localhost:3002/api/promotions");

        if (!res.ok) {
          throw new Error("Failed to fetch ticket prices");
        }

        const data = await res.json();
        
        const promo = data.find((a) => (a.promoCode || "").toLowerCase() === name.trim().toLowerCase());

        if (!promo) {
          setPromoError("Promo code does not exist.");
          return;
        }

        // Check expiration
        const now = new Date();
        const exp = new Date(promo.expirationDate);
        if (exp < now) {
          setPromoError("Promo code has expired.");
          return;
        }

        // success
        setAppliedPromo(promo);
        setPromoError("");

      } catch (error) {
        console.error("Error fetching promo code:", error);
        setPromoError("Failed to validate promotion. Try again.");
      }
  }

  const removePromotion = () => {
    setAppliedPromo(null);
    setPromoCode("");
    setPromoError("");
  }

  const computeTotalWithPromo = () => {
    if (!ticketPrices) return total;
    if (!appliedPromo) return total;
    const raw = (appliedPromo.promoValue || "").toString().trim();
    if (!raw) return total;


    const numeric = parseFloat(raw);
    if (Number.isFinite(numeric)) {
      return Math.max(0, total - total * (numeric / 100));
    }

    return total;
  }

  const formatPromoValue = (valueRaw) => {
    const raw = (valueRaw || "").toString().trim();
    if (!raw) return "";
    const numeric = parseFloat(raw);
    if (Number.isFinite(numeric)) return `${numeric}%`;
    return raw;
  }
  const discountedTotal = computeTotalWithPromo();

  return (
    <div className="checkout-page-wrapper">
      <h1 className="checkout-title">Checkout</h1>

      {expiryTime && (
        <div style={{ marginBottom: "10px", width: "100%" }}>
          <BookingTimer expiryTimestamp={expiryTime} />
        </div>
      )}

      <Grid container spacing={24}>
        {/* --- LEFT COLUMN: ADDRESSES --- */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} className="section-card">
            <h2 className="section-header">Billing & Shipping</h2>

            <h3 className="sub-header">Home Address</h3>
            <TextField
              fullWidth
              label="Street Address"
              variant="outlined"
              size="small"
              margin="normal"
              value={homeAddress.street}
              onChange={(e) => {
                setHomeAddress({ ...homeAddress, street: e.target.value });
                clearError('homeStreet');
              }}
              error={!!errors.homeStreet}
              helperText={errors.homeStreet}
              required
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="City"
                  size="small"
                  margin="normal"
                  value={homeAddress.city}
                  onChange={(e) => { setHomeAddress({ ...homeAddress, city: e.target.value }); clearError('homeCity'); }}
                  error={!!errors.homeCity}
                  helperText={errors.homeCity}
                  required
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label="State"
                  size="small"
                  margin="normal"
                  value={homeAddress.state}
                  onChange={(e) => { setHomeAddress({ ...homeAddress, state: e.target.value }); clearError('homeState'); }}
                  error={!!errors.homeState}
                  helperText={errors.homeState}
                  required
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label="Zip"
                  size="small"
                  margin="normal"
                  value={homeAddress.zip}
                  onChange={(e) => { setHomeAddress({ ...homeAddress, zip: e.target.value }); clearError('homeZip'); }}
                  error={!!errors.homeZip}
                  helperText={errors.homeZip}
                  required
                />
              </Grid>
            </Grid>

            <Divider style={{ margin: "30px 0" }} />

            <h3 className="sub-header">Billing Address</h3>
            <FormControlLabel
              control={
                <Checkbox
                  checked={sameAsHome}
                  onChange={handleSameAsHomeChange}
                />
              }
              label="Same as Home Address"
              style={{ marginBottom: "10px" }}
            />

            <div style={{ opacity: sameAsHome ? 0.5 : 1, transition: "0.3s" }}>
              <TextField
                fullWidth
                label="Street Address"
                size="small"
                margin="normal"
                disabled={sameAsHome}
                value={paymentAddress.street}
                onChange={(e) => { setPaymentAddress({ ...paymentAddress, street: e.target.value }); clearError('paymentStreet'); }}
                error={!!errors.paymentStreet}
                helperText={errors.paymentStreet}
                required={!sameAsHome}
              />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="City"
                    size="small"
                    margin="normal"
                    disabled={sameAsHome}
                    value={paymentAddress.city}
                    onChange={(e) => { setPaymentAddress({ ...paymentAddress, city: e.target.value }); clearError('paymentCity'); }}
                    error={!!errors.paymentCity}
                    helperText={errors.paymentCity}
                    required={!sameAsHome}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    label="State"
                    size="small"
                    margin="normal"
                    disabled={sameAsHome}
                    value={paymentAddress.state}
                    onChange={(e) => { setPaymentAddress({ ...paymentAddress, state: e.target.value }); clearError('paymentState'); }}
                    error={!!errors.paymentState}
                    helperText={errors.paymentState}
                    required={!sameAsHome}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    label="Zip"
                    size="small"
                    margin="normal"
                    disabled={sameAsHome}
                    value={paymentAddress.zip}
                    onChange={(e) => { setPaymentAddress({ ...paymentAddress, zip: e.target.value }); clearError('paymentZip'); }}
                    error={!!errors.paymentZip}
                    helperText={errors.paymentZip}
                    required={!sameAsHome}
                  />
                </Grid>
              </Grid>
            </div>
          </Paper>
        </Grid>

        {/* --- RIGHT COLUMN: SUMMARY --- */}
        <Grid item xs={12} md={4}>
          <div className="right-column-stack">
            {/* ORDER SUMMARY */}
            <Paper elevation={0} className="receipt-card">
              <div className="receipt-header">
                <h3>Order Summary</h3>
              </div>
              <div className="receipt-content">
                <div className="receipt-row main-info">
                  <strong>Movie</strong> <span>{booking.movieTitle}</span>
                </div>
                <div className="receipt-row main-info">
                  <strong>Seats</strong>{" "}
                  <span>{booking.seatsSelected?.join(", ")}</span>
                </div>

                <Divider style={{ margin: "15px 0", borderStyle: "dashed" }} />

                {/* DYNAMIC ITEM ROWS */}
                {pricesLoading ? (
                  <div style={{ textAlign: "center", color: "#999" }}>
                    Loading prices...
                  </div>
                ) : (
                  items.map((item) => (
                    <div className="receipt-row" key={item.type}>
                      <span>
                        {item.type} Ticket x {item.count}
                      </span>
                      <span>${item.subtotal.toFixed(2)}</span>
                    </div>
                  ))
                )}

                <div className="promo-box">
                  <TextField
                    placeholder="Promo Code"
                    size="small"
                    fullWidth
                    value={promoCode}
                    error={!!promoError}
                    helperText={promoError || (appliedPromo ? `Promo applied: ${appliedPromo.promoCode} (${formatPromoValue(appliedPromo.promoValue)})` : "")}
                    onChange={(e) => {
                      setPromoCode(e.target.value);
                      if (promoError) setPromoError("");
                    }}
                    InputProps={{
                      endAdornment: (
                        <Button style={{ marginRight: "-10px" }} onClick={() => applyPromotion()}>
                          Apply
                        </Button>
                      ),
                    }}
                  />
                  {appliedPromo && (
                      <div className="promo-success">
                      <span>Promotion <strong>{appliedPromo.promoCode}</strong> applied ({formatPromoValue(appliedPromo.promoValue)}).</span>
                      <Button size="small" onClick={removePromotion}>Remove</Button>
                    </div>
                  )}
                </div>
              </div>
              {appliedPromo ? (
                <>
                  <div className="receipt-row">
                    <span>Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="receipt-row">
                    <span>Discount ({appliedPromo.promoCode})</span>
                    <span>-${(total - discountedTotal).toFixed(2)}</span>
                  </div>
                  <div className="receipt-total">
                    <span>Total</span>
                    <span>${discountedTotal.toFixed(2)}</span>
                  </div>
                </>
              ) : (
                <div className="receipt-total">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              )}
            </Paper>

            {/* PAYMENT DETAILS */}
            <Paper elevation={0} className="section-card payment-card">
              <h3 className="sub-header">Payment Details</h3>
              <TextField
                fullWidth
                label="Card Number"
                placeholder="0000 0000 0000 0000"
                margin="dense"
                size="small"
                value={cardDetails.number}
                onChange={(e) => { setCardDetails({ ...cardDetails, number: e.target.value }); clearError('cardNumber'); }}
                error={!!errors.cardNumber}
                helperText={errors.cardNumber}
                required
              />
              <div style={{ display: "flex", gap: "10px" }}>
                <TextField
                  fullWidth
                  label="Name"
                  placeholder="John Doe"
                  margin="dense"
                  size="small"
                  value={cardDetails.name}
                  onChange={(e) => { setCardDetails({ ...cardDetails, name: e.target.value }); clearError('cardName'); }}
                  error={!!errors.cardName}
                  helperText={errors.cardName}
                  required
                />
                <TextField
                  fullWidth
                  label="Expiry"
                  placeholder="MM/YY"
                  margin="dense"
                  size="small"
                  value={cardDetails.exp}
                  onChange={(e) => { setCardDetails({ ...cardDetails, exp: e.target.value }); clearError('cardExp'); }}
                  error={!!errors.cardExp}
                  helperText={errors.cardExp}
                  required
                />
              </div>
              {Object.keys(errors).length > 0 && (
                <div style={{ color: '#d32f2f', fontWeight: 600, marginTop: 12 }}>
                  Please complete all required fields.
                </div>
              )}
              <Button
                variant="contained"
                color="error"
                fullWidth
                size="large"
                style={{ marginTop: "20px" }}
                onClick={handleConfirmPayment}
              >
                Pay ${discountedTotal.toFixed(2)}
              </Button>
            </Paper>
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

export default withAuth(CheckoutPage, [2]);

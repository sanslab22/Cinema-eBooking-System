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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import "./page.css";
import BookingTimer from "../components/BookingTimer";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

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
    cvv: "",
  });
  const [savedCards, setSavedCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null); // number id or 'new'
  const [userFullName, setUserFullName] = useState("");
  const [saveCard, setSaveCard] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [errors, setErrors] = useState({});
  const [email, setEmail] = useState("");
  const [paymentError, setPaymentError] = useState(""); // <--- NEW: For booking/payment errors

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

        setEmail(userData.email);

        const backendHome = userData.addresses?.find(
          (addr) => addr.addressTypeId === 1
        );

        if (backendHome) {
          setHomeAddress({
            street: backendHome.street || "",
            city: backendHome.city || "",
            state: backendHome.state || "",
            zip: backendHome.zipCode || backendHome.zip || "",
          });
        }
        if (userData.paymentCards && userData.paymentCards.length > 0) {
          const savedCard = userData.paymentCards[0];
          setSavedCards(userData.paymentCards || []);
          setSelectedCardId(String(savedCard.id));
          setCardDetails({
            number: savedCard.cardNo || `•••• ${savedCard.maskedCardNo}`,
            exp: savedCard.expirationDate || "",
            name: `${userData.firstName || ""} ${
              userData.lastName || ""
            }`.trim(),
            cvv: "***",
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
        if (!userData.paymentCards || userData.paymentCards.length === 0) {
          setSavedCards([]);
          setSelectedCardId(null);
        }
        setUserFullName(
          `${userData.firstName || ""} ${userData.lastName || ""}`.trim()
        );
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

  const handleSavedCardChange = (value) => {
    if (!value || value === "new") {
      // Use new card
      setSelectedCardId(null); // Use null for 'new'
      setCardDetails({ number: "", exp: "", name: userFullName || "", cvv: "" });
      setPaymentAddress({ street: "", city: "", state: "", zip: "" });
      clearError("cardNumber");
      clearError("cardName");
      clearError("cardExp");
      clearError("paymentStreet");
      return;
    }

    const id = Number(value);
    const c = savedCards.find((s) => s.id === id);
    if (!c) return;
    setSelectedCardId(String(c.id));
    setCardDetails({
      number: c.cardNo || `•••• ${c.maskedCardNo}`,
      exp: c.expirationDate,
      name: c.nameOnCard || userFullName,
      cvv: "***",
    });
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.cardNumber;
      delete copy.cardName;
      delete copy.cardExp;
      return copy;
    });
    if (c.billingAddress) {
      setPaymentAddress({
        street: c.billingAddress.street || "",
        city: c.billingAddress.city || "",
        state: c.billingAddress.state || "",
        zip: c.billingAddress.zipCode || c.billingAddress.zip || "",
      });
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.paymentStreet;
        delete copy.paymentCity;
        delete copy.paymentState;
        delete copy.paymentZip;
        return copy;
      });

      if (
        c.billingAddress.street &&
        c.billingAddress.street === homeAddress.street
      ) {
        setSameAsHome(true);
      } else {
        setSameAsHome(false);
      }
    }
    clearError("cardNumber");
  };

  // --- HANDLERS ---
  const handleSameAsHomeChange = (e) => {
    setSameAsHome(e.target.checked);
    if (e.target.checked) {
      setPaymentAddress({ ...homeAddress });
      setErrors((prev) => {
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

  const handleConfirmPayment = async () => {
    if (!validateFields()) return;
    setPaymentError(""); // Clear previous errors

    try {
      const userId = Number(localStorage.getItem("userId"));
      const showID = Number(localStorage.getItem("showID"));
      if (!userId || !showID) {
        alert("Missing user or show info. Please start booking again.");
        return;
      }

      let saveCardChoice = false;
      if (!selectedCardId) {
        saveCardChoice = !!saveCard;
      }

      const payload = {
        userID: userId,
        showTimeID: showID,
        seatsSelected: booking.seatsSelected || [],
        noOfTickets:
          Object.values(booking.ticketCounts || {}).reduce(
            (a, b) => a + b,
            0
          ) || (booking.seatsSelected || []).length,
        selectedCardId: selectedCardId ? Number(selectedCardId) : undefined,
        card: selectedCardId
          ? undefined
          : {
              cardNo: cardDetails.number || "",
              expirationDate: cardDetails.exp || "",
              nameOnCard: cardDetails.name || "",
              billingAddress: {
                street: paymentAddress.street || "",
                city: paymentAddress.city || "",
                state: paymentAddress.state || "",
                zipCode: paymentAddress.zip || "",
              },
            },
        saveCard: saveCardChoice,
        promoID: appliedPromo ? appliedPromo.id : undefined,
      };

      const res = await fetch("http://localhost:3002/api/createBooking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        const errorMessage = data.error || data.message || "Failed to create booking";
        setPaymentError(errorMessage);

        return;
      }

      const result = await res.json();
      // Get all order details for the confirmation page
      const { subtotal, bookingFee, tax } = getOrderDetails();
      // Prepare confirmation payload
      const maskCard = (num) => {
        const s = (num || "").toString();
        if (s.includes("•") || s.length <= 4) return s;
        return `•••• ${s.slice(-4)}`;
      };
      const confirmation = {
        bookingId: result.id,
        movieTitle: booking.movieTitle,
        showTime: booking.time || booking.showTime || "",
        seatsSelected: booking.seatsSelected || [],
        subtotal: getOrderDetails().subtotal,
        bookingFee: getOrderDetails().bookingFee,
        tax: getOrderDetails().tax,
        discountAmount: total - discountedTotal,
        total: discountedTotal,
        promoCode: appliedPromo?.promoCode || undefined,

        maskedCard: selectedCardId
          ? savedCards.find((c) => String(c.id) === String(selectedCardId))
              ?.cardNo || "Saved Card"
          : maskCard(cardDetails.number),
      };
      localStorage.setItem("bookingConfirmation", JSON.stringify(confirmation));
      localStorage.removeItem("bookingData");
      router.push("/checkout/confirmation");

      try {
        await addDoc(collection(db, "mail"), {
          to: email,
          message: {
            subject: `New Booking: ${confirmation.movieTitle}!`,
            html: `
          <p>Dear Customer,</p>
          <p>This is the confirmation email for your new booking</p>
                    <p><b>Id: ${confirmation.bookingId}</b></p>

          <p><b>Movie: ${confirmation.movieTitle}</b></p>
          <p><b>Show Time: ${confirmation.showTime}%</b></p>
          <p><b>Seats: ${confirmation.seatsSelected}</b></p>
          <p><b>Total: $${confirmation.total}</b></p>
          <p>See you at the theaters soon!</p>
        `,
          },
        });
      } catch (err) {
        console.error("Failed to send email:", err.message);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Payment failed. Please try again.");
    }
  };

  // Validate required fields. All fields required except promo code; when sameAsHome is true, billing address fields are not required
  const validateFields = () => {
    const newErrors = {};

    // Home address
    if (!homeAddress.street || !homeAddress.street.trim())
      newErrors.homeStreet = "Street address is required.";
    if (!homeAddress.city || !homeAddress.city.trim())
      newErrors.homeCity = "City is required.";
    if (!homeAddress.state || !homeAddress.state.trim())
      newErrors.homeState = "State is required.";
    if (!homeAddress.zip || !homeAddress.zip.trim())
      newErrors.homeZip = "Zip is required.";

    // Payment address (only required if not sameAsHome)
    if (!sameAsHome) {
      if (!paymentAddress.street || !paymentAddress.street.trim())
        newErrors.paymentStreet = "Street address is required.";
      if (!paymentAddress.city || !paymentAddress.city.trim())
        newErrors.paymentCity = "City is required.";
      if (!paymentAddress.state || !paymentAddress.state.trim())
        newErrors.paymentState = "State is required.";
      if (!paymentAddress.zip || !paymentAddress.zip.trim())
        newErrors.paymentZip = "Zip is required.";
    }

    // Card details: if using saved card (selectedCardId) then skip card fields validation
    if (!selectedCardId) {
      if (!cardDetails.number || !cardDetails.number.trim())
        newErrors.cardNumber = "Card number is required.";
      if (!cardDetails.name || !cardDetails.name.trim())
        newErrors.cardName = "Name on card is required.";
      if (!cardDetails.exp || !cardDetails.exp.trim())
        newErrors.cardExp = "Expiry date is required.";
      else if (!isExpiryValid(cardDetails.exp))
        newErrors.cardExp = "Expiry must be a valid future date (MM/YY).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Returns { total: 0, items: [] }
  const getOrderDetails = () => {
    if (!booking || !ticketPrices)
      return { total: 0, items: [], subtotal: 0, tax: 0, bookingFee: 0 };

    const counts = booking.ticketCounts || {};
    let subtotal = 0;
    const items = [];

    // Loop through the ticket types in localStorage (e.g., "Child", "Adult")
    // Filter out "Booking Fee" if it's in the counts object for some reason
    Object.keys(counts).filter(type => type !== "Booking Fee").forEach((type) => {
      const count = counts[type];
      const price = ticketPrices[type] || 0; // Matches DB price

      if (count > 0) {
        const itemSubtotal = count * price;
        subtotal += itemSubtotal;
        items.push({ type, count, price, subtotal: itemSubtotal });
      }
    });

    const bookingFee = ticketPrices["Booking Fee"] || 0;

    const totalBeforeTax = subtotal + bookingFee;
    const tax = totalBeforeTax * 0.07; // 7% sales tax
    const total = totalBeforeTax + tax;

    return { total, items, subtotal, tax, bookingFee };
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

      const promo = data.find(
        (a) => (a.promoCode || "").toLowerCase() === name.trim().toLowerCase()
      );

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

      // Check start date
      const start = new Date(promo.startDate);
      // Compare dates only, ignoring time
      const today = new Date();
      if (start.setHours(0, 0, 0, 0) > today.setHours(0, 0, 0, 0)) {
        setPromoError("This promotion has not started yet.");
        return;
      }

      // success
      setAppliedPromo(promo);
      setPromoError("");
    } catch (error) {
      console.error("Error fetching promo code:", error);
      setPromoError("Failed to validate promotion. Try again.");
    }
  };

  const removePromotion = () => {
    setAppliedPromo(null);
    setPromoCode("");
    setPromoError("");
  };

  const computeTotalWithPromo = () => {
    if (!ticketPrices) return total;
    if (!appliedPromo) return total;

    // Note: Promotions typically apply to subtotal, not including fees/taxes.
    // We will apply discount to the ticket subtotal only.
    const { subtotal, tax, bookingFee: feeFromDetails } = getOrderDetails();
    const bookingFee = ticketPrices["Booking Fee"] || 0;

    const raw = (appliedPromo.promoValue || "").toString().trim();
    if (!raw) return total;

    const numeric = parseFloat(raw);
    if (Number.isFinite(numeric)) return subtotal * (1 - numeric / 100) + bookingFee + tax;

    return total;
  };
  // Validate expiry date: format MM/YY or MM/YYYY and in the future
  const isExpiryValid = (exp) => {
    if (!exp || typeof exp !== "string") return false;
    const trimmed = exp.trim();
    // allow formats: MM/YY or MM/YYYY
    const mmYY = /^([0-1]?\d)\/(\d{2})$/; // MM/YY
    const mmYYYY = /^([0-1]?\d)\/(\d{4})$/; // MM/YYYY
    let month, year;
    if (mmYY.test(trimmed)) {
      const parts = trimmed.split("/");
      month = Number(parts[0]);
      year = 2000 + Number(parts[1]);
    } else if (mmYYYY.test(trimmed)) {
      const parts = trimmed.split("/");
      month = Number(parts[0]);
      year = Number(parts[1]);
    } else {
      return false;
    }
    if (month < 1 || month > 12) return false;
    // Expiry is end-of-month
    const expiryDate = new Date(year, month, 0, 23, 59, 59, 999); // last millisecond of the month
    const now = new Date();
    return expiryDate > now;
  };

  const formatPromoValue = (valueRaw) => {
    const raw = (valueRaw || "").toString().trim();
    if (!raw) return "";
    const numeric = parseFloat(raw);
    if (Number.isFinite(numeric)) return `${numeric}%`;
    return raw;
  };
  const discountedTotal = computeTotalWithPromo();

  return (
    <div className="checkout-page-wrapper">
      {expiryTime && (
        <div style={{ marginBottom: "10px", width: "100%" }}>
          <BookingTimer expiryTimestamp={expiryTime} />
        </div>
      )}
      <h1 className="checkout-title">Checkout</h1>

      

      <Grid container spacing={20}>
        
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
                clearError("homeStreet");
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
                  onChange={(e) => {
                    setHomeAddress({ ...homeAddress, city: e.target.value });
                    clearError("homeCity");
                  }}
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
                  onChange={(e) => {
                    setHomeAddress({ ...homeAddress, state: e.target.value });
                    clearError("homeState");
                  }}
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
                  onChange={(e) => {
                    setHomeAddress({ ...homeAddress, zip: e.target.value });
                    clearError("homeZip");
                  }}
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
                onChange={(e) => {
                  setPaymentAddress({
                    ...paymentAddress,
                    street: e.target.value,
                  });
                  clearError("paymentStreet");
                }}
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
                    onChange={(e) => {
                      setPaymentAddress({
                        ...paymentAddress,
                        city: e.target.value,
                      });
                      clearError("paymentCity");
                    }}
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
                    onChange={(e) => {
                      setPaymentAddress({
                        ...paymentAddress,
                        state: e.target.value,
                      });
                      clearError("paymentState");
                    }}
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
                    onChange={(e) => {
                      setPaymentAddress({
                        ...paymentAddress,
                        zip: e.target.value,
                      });
                      clearError("paymentZip");
                    }}
                    error={!!errors.paymentZip}
                    helperText={errors.paymentZip}
                    required={!sameAsHome}
                  />
                </Grid>
              </Grid>
            </div>
          </Paper>
        </Grid>

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

                {/* --- FEES & TAXES --- */}
                <Divider style={{ margin: "15px 0", borderStyle: "dashed" }} />
                <div className="receipt-row">
                  <span>Booking Fee</span>
                  <span>
                    $
                    {getOrderDetails().bookingFee.toFixed(2)}
                  </span>
                </div>
                <div className="receipt-row">
                  <span>Sales Tax (7%)</span>
                  <span>
                    $
                    {getOrderDetails().tax.toFixed(2)}
                  </span>
                </div>

                <div className="promo-box">
                  <TextField
                    placeholder="Promo Code"
                    size="small"
                    fullWidth
                    value={promoCode}
                    error={!!promoError}
                    helperText={
                      promoError ||
                      (appliedPromo
                        ? `Promo applied: ${
                            appliedPromo.promoCode
                          } (${formatPromoValue(appliedPromo.promoValue)})`
                        : "")
                    }
                    onChange={(e) => {
                      setPromoCode(e.target.value);
                      if (promoError) setPromoError("");
                      if (appliedPromo) removePromotion();
                    }}
                    InputProps={{
                      endAdornment: (
                        <Button
                          style={{ marginRight: "-10px" }}
                          onClick={() => applyPromotion()}
                        >
                          Apply
                        </Button>
                      ),
                    }}
                  />
                  {appliedPromo && (
                    <div className="promo-success">
                      <span>
                        Promotion <strong>{appliedPromo.promoCode}</strong>{" "}
                        applied ({formatPromoValue(appliedPromo.promoValue)}).
                      </span>
                      <Button size="small" onClick={removePromotion}>
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              {appliedPromo ? (
                <>
                  <div className="receipt-row">
                    <span>Total Before Discount</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="receipt-row">
                    <span>Promo Discount ({appliedPromo.promoCode})</span>
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
              {savedCards && savedCards.length > 0 && (
                <FormControl fullWidth size="small" margin="dense">
                  <InputLabel id="saved-card-label">Saved Card</InputLabel>
                  <Select
                    labelId="saved-card-label"
                    label="Saved Card"
                    value={selectedCardId || "new"}
                    onChange={(e) => handleSavedCardChange(e.target.value)}
                  >
                    <MenuItem value={"new"}>Use a new card</MenuItem>
                    {savedCards.map((c) => (
                      <MenuItem key={c.id} value={String(c.id)}>
                        {`${c.cardNo || `•••• ${c.maskedCardNo}`} — Exp ${
                          c.expirationDate || ""
                        }`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              <TextField
                fullWidth
                label="Card Number"
                placeholder="0000 0000 0000 0000"
                margin="dense"
                size="small"
                value={cardDetails.number}
                onChange={(e) => {
                  setCardDetails({ ...cardDetails, number: e.target.value });
                  clearError("cardNumber");
                }}
                disabled={!!selectedCardId}
                error={!!errors.cardNumber}
                helperText={errors.cardNumber}
                required
              />
              <TextField
                fullWidth
                label="Name on Card"
                placeholder="John Doe"
                margin="dense"
                size="small"
                value={cardDetails.name}
                onChange={(e) => {
                  setCardDetails({ ...cardDetails, name: e.target.value });
                  clearError("cardName");
                }}
                disabled={!!selectedCardId}
                error={!!errors.cardName}
                helperText={errors.cardName}
                required
              />
              <div style={{ display: "flex", gap: "10px" }}>
                <TextField
                  fullWidth
                  label="Expiry"
                  placeholder="MM/YY"
                  margin="dense"
                  size="small"
                  value={cardDetails.exp}
                  onChange={(e) => {
                    setCardDetails({ ...cardDetails, exp: e.target.value });
                    clearError("cardExp");
                  }}
                  disabled={!!selectedCardId}
                  error={!!errors.cardExp}
                  helperText={errors.cardExp}
                  required
                />
                <TextField
                  fullWidth
                  label="Security Code"
                  placeholder="CVC"
                  margin="dense"
                  size="small"
                  value={cardDetails.cvv}
                  onChange={(e) => {
                    setCardDetails({ ...cardDetails, cvv: e.target.value });
                  }}
                  disabled={!!selectedCardId}
                  // No validation as requested
                  error={false}
                  helperText={""}
                  required
                />
              </div>
              {/* Save card checkbox (only when using a new card) */}
              {!selectedCardId && savedCards.length < 3 && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={saveCard}
                      onChange={(e) => setSaveCard(e.target.checked)}
                    />
                  }
                  label="Save card for future use"
                  style={{ marginTop: 12 }}
                />
              )}
              {paymentError && (
                <div
                  style={{
                    color: "#d32f2f",
                    fontWeight: 600,
                    marginTop: 12,
                  }}
                >
                  {paymentError}
                </div>
              )}
              {Object.keys(errors).length > 0 && (
                <div
                  style={{ color: "#d32f2f", fontWeight: 600, marginTop: 12 }}
                >
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
                disabled={Object.keys(errors).length > 0}
              >
                Pay ${Math.max(0, discountedTotal).toFixed(2)}
              </Button>
            </Paper>
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

export default withAuth(CheckoutPage, [2]);

"use client";
import { Button } from "@mui/material";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import "./page.css";
import { useState, useEffect } from "react";
import withAuth from "../../../hoc/withAuth";
import BookingTimer from "../../../components/BookingTimer.js";


function Page() {
  const router = useRouter();
  const { movieTitle, time } = useParams();

  const [step, setStep] = useState(1);
  const [ticketCategories, setTicketCategories] = useState([]);
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [priceError, setPriceError] = useState(null);
  const [ticketCounts, setTicketCounts] = useState({});
  const [auditoriumSeats, setAuditoriumSeats] = useState([]);
  const [seatsLoading, setSeatsLoading] = useState(true);
  const [seatsError, setSeatsError] = useState(null);
  const [seatsSelected, setSeatsSelected] = useState([]);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [expiryTime, setExpiryTime] = useState(null);

  // --- Format showtime to EST ---
  const formatTimeEST = (rawTime) => {
    if (!rawTime) return "N/A";
    let decoded = decodeURIComponent(rawTime);
    if (decoded.includes("+")) {
      const parts = decoded.split("+");
      const isoPart = parts.find((p) => p.includes("T"));
      if (isoPart) decoded = isoPart;
    }
    const dateObj = new Date(decoded);
    if (isNaN(dateObj.getTime())) return decoded;
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      timeZone: "America/New_York",
      timeZoneName: "short",
    }).format(dateObj);
  };


  // --- Fetch ticket categories ---
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("http://localhost:3002/api/ticket-categories");
        const json = await res.json();
        if (json.success) {
          setTicketCategories(json.data);
          setLoadingPrices(false);
        } else {
          setPriceError("Failed to load ticket prices.");
        }
      } catch (err) {
        console.error(err);
        setPriceError("Error loading ticket prices.");
      }
    }
    fetchCategories();
  }, []);

  // --- Fetch auditorium seats ---
  useEffect(() => {
    async function fetchSeats() {
      setSeatsLoading(true);
      setSeatsError(null);
      try {
        const res = await fetch(
          "http://localhost:3002/api/auditoriums?includeSeats=true"
        );
        const json = await res.json();
        if (json.auditoriums && json.auditoriums.length > 0) {
          setAuditoriumSeats(json.auditoriums[0].seats || []);
        } else {
          setAuditoriumSeats([]);
        }
      } catch (err) {
        console.error(err);
        setSeatsError("Failed to load seats.");
      } finally {
        setSeatsLoading(false);
      }
    }
    fetchSeats();
  }, []);

  // --- Handle ticket count change ---
  const updateTicketCount = (categoryName, value) => {
    setTicketCounts((prev) => ({
      ...prev,
      [categoryName]: Math.max(0, parseInt(value) || 0),
    }));
  };

  const totalTickets = Object.values(ticketCounts).reduce((sum, n) => sum + n, 0);

  // --- Handle seat selection ---
  const updateSeatsSelected = (seatId) => {
    const alreadySelected = seatsSelected.includes(seatId);
   
    // User is selecting a seat (NOT unselecting)
    const isFirstSelection = !alreadySelected && seatsSelected.length === 0;
   
    // If this is the first seat chosen -> START THE TIMER
    if (isFirstSelection) {
      const newExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
      setExpiryTime(newExpiry);
   
      localStorage.setItem(
        "bookingData",
        JSON.stringify({
          data: {
            step: 2,
            ticketCounts,
            seatsSelected: [seatId], // first seat
            movieTitle: decodeURIComponent(movieTitle),
            time: decodeURIComponent(time),
          },
          expiry: newExpiry,
        })
      );
    }
   
    // ---- Existing seat toggle logic ----
    if (alreadySelected) {
      setSeatsSelected(seatsSelected.filter((s) => s !== seatId));
      setError(false);
      setErrorMessage("");
    } else if (seatsSelected.length >= totalTickets && totalTickets > 0) {
      setError(true);
      setErrorMessage("You have selected the maximum number of seats.");
    } else {
      setSeatsSelected([...seatsSelected, seatId]);
      setError(false);
      setErrorMessage("");
    }
  };

  // --- Handle checkout ---
  const handleCheckout = () => {
    // const extendedExpiry = new Date().getTime() + 30 * 60 * 1000; // <-- REMOVE THIS LINE
    const bookingData = {
      data: {
        step,
        ticketCounts,
        seatsSelected,
        movieTitle: decodeURIComponent(movieTitle),
        time: decodeURIComponent(time),
      },
      expiry: expiryTime, // <-- USE THE EXISTING STATE VARIABLE
    };
    localStorage.setItem("bookingData", JSON.stringify(bookingData));

    const isLoggedIn = localStorage.getItem("userId") || false;
    if (isLoggedIn) router.push("/checkout");
    else router.push("/login?redirect=/checkout");
  };

  // --- Handle Timer Expiry ---
  const handleSessionExpire = () => {
    alert("Booking session expired!");
    localStorage.removeItem("bookingData");
    setStep(1);
    setSeatsSelected([]);
    setTicketCounts({});
    setExpiryTime(null);
  };

  return (
    <div>
      {/* --- MOVED TIMER HERE so it persists across steps --- */}
      {expiryTime && (
        <BookingTimer
          expiryTimestamp={expiryTime}
          onExpire={handleSessionExpire}
        />
      )}

      <h1 style={{ textAlign: "center", marginTop: "20px" }}>Book Tickets</h1>
      <div className="booking-container">
        
        {step === 1 ? (
          <>
            <h2>Select Tickets</h2>
            {error && <p className="error-message">{errorMessage}</p>}
            {priceError && <p className="error-message">{priceError}</p>}
            {loadingPrices ? (
              <p>Loading ticket prices...</p>
            ) : (
              <div className="ticket-selection">
                {ticketCategories.map((cat) => (
                  <div key={cat.id}>
                    <label>{cat.name} – ${cat.price}</label>
                    <input
                      type="number"
                      min="0"
                      value={ticketCounts[cat.name] || 0}
                      onChange={(e) => updateTicketCount(cat.name, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            )}
            <Button
              variant="contained"
              onClick={() => {
                if (totalTickets === 0) {
                  setError(true);
                  setErrorMessage("Please add at least one ticket.");
                } else setStep(2);
              }}
            >
              Next
            </Button>
          </>
        ) : step === 2 ? (
          <>
            <h2>Select Seats</h2>
            {/* Timer removed from here */}
            {error && <p className="error-message">{errorMessage}</p>}
            {seatsError && <p className="error-message">{seatsError}</p>}
            <p># of seats left to select: {totalTickets - seatsSelected.length}</p>
            {seatsLoading ? (
              <p>Loading seats...</p>
            ) : (
              <div className="seats">
                {auditoriumSeats.map(({ id, rowNum, colNum }) => {
                  const seatLabel = `${rowNum}${colNum}`;
                  return (
                    <Button
                      key={id}
                      className="seat-button"
                      variant="contained"
                      color={seatsSelected.includes(seatLabel) ? "primary" : "secondary"}
                      onClick={() => updateSeatsSelected(seatLabel)}
                    >
                      {seatLabel}
                    </Button>
                  );
                })}
              </div>
            )}
            <Button
              variant="contained"
              className="next-button"
              onClick={() => {
                if (seatsSelected.length === totalTickets) setStep(3);
                else {
                  setError(true);
                  setErrorMessage("Select seats for all tickets.");
                }
              }}
            >
              Next
            </Button>
          </>
        ) : (
          <>
            <h2>Confirm Booking Details</h2>
            <div className="booking-details">
              <p>
                <strong>Movie:</strong> {decodeURIComponent(movieTitle)}
              </p>
              <p>
                <strong>Showtime:</strong> {formatTimeEST(time)}
              </p>
              <p>
                <strong>Seats:</strong> {seatsSelected.join(", ")}
              </p>
              {ticketCategories.map((cat) => (
                <p key={cat.id}>
                  <strong>{cat.name}:</strong> {ticketCounts[cat.name] || 0}
                </p>
              ))}
              <div className="confirmation-buttons">
                <Button variant="contained" onClick={() => setStep(2)}>
                  Go Back
                </Button>
                <Button variant="contained" onClick={handleCheckout}>
                  Checkout
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
export default withAuth(Page, [0,2]);
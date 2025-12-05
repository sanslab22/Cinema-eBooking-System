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
  const [maxSeats, setMaxSeats] = useState(0);

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

  // Clean temp seats
  const cleanupTempSeats = async () => {
    const showID = localStorage.getItem("showID");
    if (!showID) return;
  
    try {
      await fetch(`http://localhost:3002/api/showSeats/${showID}/releaseAll`, {
        method: "POST",
      });
    } catch (err) {
      console.error("Cleanup failed", err);
    }
  };

  // Cleanup seats when user leaves the site or timer ends
  useEffect(() => {
    const handleBeforeUnload = () => cleanupTempSeats();
    const handlePopState = () => cleanupTempSeats();  // Back button

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

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

  // --- Fetch auditorium seats with status ---
  useEffect(() => {
    const showID = localStorage.getItem("showID");
    const auditoriumID = localStorage.getItem("auditoriumID");

    if (!showID || !auditoriumID) return;

    async function fetchSeatsWithStatus() {
      setSeatsLoading(true);
      setSeatsError(null);
      try {
        const res = await fetch(
          `http://localhost:3002/api/auditoriums/${auditoriumID}?includeSeats=true&showID=${showID}`
        );
        if (!res.ok) throw new Error("Failed to fetch seats");
        const json = await res.json();

        if (json.seats) {
          setAuditoriumSeats(json.seats);
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

    fetchSeatsWithStatus();
  }, []);

  // --- Fetch the noAvailableSeats ---
  useEffect(() => {
    const storedMax = localStorage.getItem("noAvailableSeats");
    if (storedMax) {
      setMaxSeats(parseInt(storedMax, 10));
    }
  }, []);

  // --- Handle ticket count change ---
  const updateTicketCount = (categoryName, value) => {
    const newCounts = {
      ...ticketCounts,
      [categoryName]: Math.max(0, parseInt(value) || 0),
    };
    const newTotal = Object.values(newCounts).reduce((a, b) => a + b, 0);
    if (newTotal > maxSeats) {
      setError(true);
      setErrorMessage(`There are only ${maxSeats} tickets available at this time.`);
    } else {
      setTicketCounts(newCounts);
      setError(false);
      setErrorMessage("");
    }
  };

  const totalTickets = Object.values(ticketCounts).reduce((sum, n) => sum + n, 0);

  // --- Handle seat selection with API calls to lock/release temp status ---
  const updateSeatsSelected = async (seatLabel) => {
    const showID = localStorage.getItem("showID");
    if (!showID) {
      setError(true);
      setErrorMessage("Show ID is missing.");
      return;
    }
    const seatObj = auditoriumSeats.find((s) => `${s.rowNum}${s.colNum}` === seatLabel);
    if (!seatObj) {
      setError(true);
      setErrorMessage("Invalid seat selected.");
      return;
    }
    const seatID = seatObj.id;
    const alreadySelected = seatsSelected.includes(seatLabel);

    // User is selecting a seat (NOT unselecting)
    const isFirstSelection = !alreadySelected && seatsSelected.length === 0;

    if (!alreadySelected) {
      // Select seat → set status to 'temp' via API
      try {
        const res = await fetch(`http://localhost:3002/api/showSeats/${showID}/${seatID}/temp`, {
          method: "POST",
        });
        if (!res.ok) throw new Error("Failed to lock seat");
        // Seat locked successfully, update local state
        const futureCount = seatsSelected.length + 1;
        if (futureCount > maxSeats) {
          setError(true);
          setErrorMessage(`You can select a maximum of ${maxSeats} seats.`);
          return;
        }
        if (futureCount > totalTickets) {
          setError(true);
          setErrorMessage("You have selected the maximum number of seats.");
          return;
        }
        setSeatsSelected([...seatsSelected, seatLabel]);
        setError(false);
        setErrorMessage("");

        // Start the timer if first seat selected
        if (isFirstSelection) {
          const newExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
          setExpiryTime(newExpiry);

          localStorage.setItem(
            "bookingData",
            JSON.stringify({
              data: {
                step: 2,
                ticketCounts,
                seatsSelected: [seatLabel], // first seat
                movieTitle: decodeURIComponent(movieTitle),
                time: decodeURIComponent(time),
              },
              expiry: newExpiry,
            })
          );
        }
      } catch (error) {
        alert("This seat is no longer available.");
      }
    } else {
      // Deselect seat → release the 'temp' lock on the seat via API
      try {
        const res = await fetch(`http://localhost:3002/api/showSeats/${showID}/${seatID}/release`, {
          method: "POST",
        });
        if (!res.ok) throw new Error("Failed to release seat");
        setSeatsSelected(seatsSelected.filter((seat) => seat !== seatLabel));
        setError(false);
        setErrorMessage("");
      } catch (error) {
        alert("Failed to release seat lock.");
      }
    }
  };

  //Seats 

  // --- Handle checkout ---
  const handleCheckout = () => {
    const bookingData = {
      data: {
        step,
        ticketCounts,
        seatsSelected,
        movieTitle: decodeURIComponent(movieTitle),
        time: decodeURIComponent(time),
      },
      expiry: expiryTime,
    };
    localStorage.setItem("bookingData", JSON.stringify(bookingData));

    const isLoggedIn = localStorage.getItem("userId") || false;
    if (isLoggedIn) router.push("/checkout");
    else router.push("/login?redirect=/checkout");
  };

  // --- Handle Timer Expiry ---
  const handleSessionExpire = async () => {
    //alert("Booking session expired!");
  
    await cleanupTempSeats();
  
    localStorage.removeItem("bookingData");
    localStorage.removeItem("showID");
    localStorage.removeItem("noAvailableSeats");
  
    setStep(1);
    setSeatsSelected([]);
    setTicketCounts({});
    setExpiryTime(null);
  };

  // --- Show error if too many seats selected on seat selection page ---
useEffect(() => {
  if (step === 2) {
    const totalTickets = Object.values(ticketCounts).reduce((a, b) => a + b, 0);
    if (seatsSelected.length > totalTickets) {
      setError(true);
      setErrorMessage(
        `You have selected more seats (${seatsSelected.length}) than tickets (${totalTickets}). Please deselect ${seatsSelected.length - totalTickets} seat(s).`
      );
    } else {
      setError(false);
      setErrorMessage("");
    }
  }
}, [step, ticketCounts, seatsSelected]);

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
            {error && <p className="error-message">{errorMessage}</p>}
            {seatsError && <p className="error-message">{seatsError}</p>}
            <p># of seats left to select: {Math.max(0, totalTickets - seatsSelected.length)}</p>
            {seatsLoading ? (
              <p>Loading seats...</p>
            ) : (
              <div className="seats">
                {auditoriumSeats.map(({ id, rowNum, colNum, status }) => {
                  const seatLabel = `${rowNum}${colNum}`;
                  const isSelected = seatsSelected.includes(seatLabel);
                  const isUnavailable = status === "booked" || status === "temp";

                  return (
                    <Button
                      key={id}
                      className="seat-button"
                      variant="contained"
                      color={isSelected ? "primary" : "secondary"}
                      disabled={isUnavailable}
                      style={isUnavailable ? { backgroundColor: "grey", color: "white" } : undefined}
                      onClick={() => updateSeatsSelected(seatLabel)}
                    >
                      {seatLabel}
                    </Button>
                  );
                })}
              </div>
            )}
            <div className="booking-buttons">
            <Button variant="contained" onClick={() => setStep(1)} className="next-button">
                Back
              </Button>
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
            </div>
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
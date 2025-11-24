"use client";
import { Button } from "@mui/material";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import "./page.css";
import { useState, useEffect } from "react";
import withAuth from "../../../hoc/withAuth";

function Page({params}) {
  const router = useRouter();

  const { movieTitle, time } = params;

  const [step, setStep] = useState(1);
  const [ticketCategories, setTicketCategories] = useState([]);
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [priceError, setPriceError] = useState(null);

  // Dynamic ticket counts: categoryName -> count
  const [ticketCounts, setTicketCounts] = useState({});

  const [auditoriumSeats, setAuditoriumSeats] = useState([]);
  const [seatsLoading, setSeatsLoading] = useState(true);
  const [seatsError, setSeatsError] = useState(null);

  const [seatsSelected, setSeatsSelected] = useState([]);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  //load data in local storage
  useEffect(() => {
    const bookingDataJSON = localStorage.getItem("bookingData");
    if (bookingDataJSON) {
      const { data, expiry } = JSON.parse(bookingDataJSON);

      if (new Date().getTime() < expiry && data.movieTitle === decodeURIComponent(movieTitle) && data.time === decodeURIComponent(time)) {
        setStep(data.step || 1);
        setTicketCounts(data.ticketCounts || {});
        setSeatsSelected(data.seatsSelected || []);
      } else {
        localStorage.removeItem("bookingData");
      }
    }
  }, [movieTitle, time]);

  // Save booking info to localStorage on changes
  useEffect(() => {
    const expiry = new Date().getTime() + 5 * 60 * 1000; // 5 minutes
    saveBookingData(expiry);
  }, [step, seatsSelected, movieTitle, time]);

  // Helper to save data (reused in checkout)
  const saveBookingData = (expiryTime) => {
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
  };


  // Fetch ticket categories & prices
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch(
          "http://localhost:3002/api/ticket-categories"
        );
        const json = await response.json();

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

  // Fetch auditorium seats dynamically
  useEffect(() => {
    async function fetchSeats() {
      setSeatsLoading(true);
      setSeatsError(null);
      try {
        const response = await fetch(
          "http://localhost:3002/api/auditoriums?includeSeats=true"
        );
        const json = await response.json();
        console.log("Fetched seats payload:", json); // Log payload here


        if (json.auditoriums && json.auditoriums.length > 0) {
          setAuditoriumSeats(json.auditoriums[0].seats || []);
        } else {
          setAuditoriumSeats([]);
        }
      } catch (error) {
        console.error(error);
        setSeatsError("Failed to load seats.");
      } finally {
        setSeatsLoading(false);
      }
    }
    fetchSeats();
  }, []);

  // Handle changing ticket count for category
  const updateTicketCount = (categoryName, value) => {
    setTicketCounts((prev) => ({
      ...prev,
      [categoryName]: Math.max(0, parseInt(value) || 0),
    }));
  };

  // Handle seat selection toggling
  const updateSeatsSelected = (seatId) => {
    if (seatsSelected.includes(seatId)) {
      setError(false);
      setErrorMessage("");
      setSeatsSelected(seatsSelected.filter((s) => s !== seatId));
    } else {
      const totalTickets = Object.values(ticketCounts).reduce(
        (sum, n) => sum + n,
        0
      );
      if (seatsSelected.length >= totalTickets && totalTickets > 0) {
        setError(true);
        setErrorMessage(
          "You have selected the maximum number of seats. Please deselect a seat to choose a different one."
        );
      } else {
        setError(false);
        setErrorMessage("");
        setSeatsSelected([...seatsSelected, seatId]);
      }
    }
  };

  const totalTickets = Object.values(ticketCounts).reduce(
    (sum, n) => sum + n,
    0
  );

  // --- NEW LOGIC: Handle Checkout Flow ---
  const handleCheckout = () => {
    // 1. Refresh the expiry time (e.g., give them 30 mins to login/register)
    // We don't want the data to expire while they are filling out the registration form.
    const extendedExpiry = new Date().getTime() + 30 * 60 * 1000; 
    saveBookingData(extendedExpiry);

    // 2. Check Authentication
    // REPLACE THIS with your actual auth check (e.g., check cookie, check context, etc.)
    const isLoggedIn = localStorage.getItem("token") || false; 

    if (isLoggedIn) {
        // 3a. If Logged In: Go to checkout
        // Note: We DO NOT remove localStorage here. We remove it inside the Checkout page 
        // only after the payment is successful.
        router.push("/checkout");
    } else {
        // 3b. If Not Logged In: Go to login with a redirect query param
        // This tells the login page: "After you are done, send user to /checkout"
        router.push("/login?redirect=/checkout");
    }
  };

  return (
    <div>
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
                {ticketCategories.map((category) => (
                  <div key={category.id}>
                    <label>{category.name} – ${category.price}</label>
                    <input
                      type="number"
                      placeholder="0"
                      min="0"
                      value={ticketCounts[category.name] || 0}
                      onChange={(e) =>
                        updateTicketCount(category.name, e.target.value)
                      }
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
                } else {
                  setError(false);
                  setErrorMessage("");
                  setStep(2);
                }
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
            <p>
              # of seats left to select:{" "}
              {totalTickets - seatsSelected.length}
            </p>
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
                      color={
                        seatsSelected.includes(seatLabel)
                          ? "primary"
                          : "secondary"
                      }
                      onClick={() => updateSeatsSelected(seatLabel)}
                    >
                      {seatLabel}
                    </Button>
                  );
                })}
              </div>
            )}

            <br />

            <Button
              variant="contained"
              onClick={() => {
                if (seatsSelected.length === totalTickets) {
                  setStep(3);
                } else {
                  setError(true);
                  setErrorMessage("Select seats for all tickets.");
                }
              }}
              className="next-button"
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
                <strong>Showtime:</strong> {decodeURIComponent(time)}
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
                <Button
                  variant="contained"
                  onClick={() => {
                    setStep(2);
                  }}
                >
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
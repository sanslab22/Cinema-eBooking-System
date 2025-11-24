"use client";
import { Button } from "@mui/material";
import { useParams } from "next/navigation";
import "./page.css";
import { useState, useEffect } from "react";
import withAuth from "../../../hoc/withAuth";

function Page({ params }) {
  const { movieTitle, time } = params;

  const [step, setStep] = useState(1);

  const [childrenTicket, setChildrenTicket] = useState(0);
  const [adultTicket, setAdultTicket] = useState(0);
  const [seniorTicket, setSeniorTicket] = useState(0);

  const [seatsSelected, setSeatsSelected] = useState([]);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const bookingDataJSON = localStorage.getItem("bookingData");
    if (bookingDataJSON) {
      const { data, expiry } = JSON.parse(bookingDataJSON);
      if (new Date().getTime() < expiry && data.movieTitle === decodeURIComponent(movieTitle) && data.time === decodeURIComponent(time)) {
        setStep(data.step || 1);
        setChildrenTicket(data.childrenTicket || 0);
        setAdultTicket(data.adultTicket || 0);
        setSeniorTicket(data.seniorTicket || 0);
        setSeatsSelected(data.seatsSelected || []);
      } else {
        localStorage.removeItem("bookingData");
      }
    }
  }, [movieTitle, time]);

  useEffect(() => {
    const expiry = new Date().getTime() + 5 * 60 * 1000; // 5 minutes
    const bookingData = {
      data: {
        step,
        childrenTicket,
        adultTicket,
        seniorTicket,
        seatsSelected,
        movieTitle: decodeURIComponent(movieTitle),
        time: decodeURIComponent(time),
      },
      expiry,
    };
    localStorage.setItem("bookingData", JSON.stringify(bookingData));
  }, [step, childrenTicket, adultTicket, seniorTicket, seatsSelected, movieTitle, time]);

  const updateChildrenTicket = (e) => {
    setChildrenTicket(parseInt(e.target.value) || 0);
  }

  const updateAdultTicket = (e) => {
    setAdultTicket(parseInt(e.target.value) || 0);
  }

  const updateSeniorTicket = (e) => {
    setSeniorTicket(parseInt(e.target.value) || 0);
  }


  const updateSeatsSelected = (seatId) => {
    if (seatsSelected.includes(seatId)) {
      setError(false);
      setErrorMessage("");
      setSeatsSelected(seatsSelected.filter(s => s !== seatId));
    } else {
      if (seatsSelected.length >= (childrenTicket + adultTicket + seniorTicket) && (childrenTicket + adultTicket + seniorTicket) > 0) {
        setError(true);
        setErrorMessage("You have selected the maximum number of seats. Please deselect a seat to choose a different one.")
      } else {
        setError(false);
        setErrorMessage("");
        setSeatsSelected([...seatsSelected, seatId]);
      }
    }
  }

  return (
    <div>
<h1 style={{textAlign: "center", marginTop: "20px"}}>Book Tickets</h1>

      <div className="booking-container">
        {
          step == 1 ? <>
            <h2>Select Tickets</h2>
            {error && <p className="error-message">{errorMessage}</p>}
            <div className="ticket-selection">
              <div>
                <label>Children</label> <input type="number" placeholder="0" min="0" value={childrenTicket} onChange={updateChildrenTicket} />
              </div>
              <div>
                <label>Adults</label> <input type="number" placeholder="0" min="0" value={adultTicket} onChange={updateAdultTicket} />
              </div>
              <div>
                <label>Seniors</label> <input type="number" placeholder="0" min="0" value={seniorTicket} onChange={updateSeniorTicket} />
              </div>
            </div>
            <Button variant="contained" onClick={() => {
              if (childrenTicket + adultTicket + seniorTicket === 0) {
                setError(true);
                setErrorMessage("Please add at least one ticket.");
              } else {
                setError(false);
                setErrorMessage("");
                setStep(2);
              }}}>Next</Button>
          </>
          : step == 2 ?
          <>
          {console.log(seatsSelected)}
            <h2>Select Seats</h2>
            {error && <p className="error-message">{errorMessage}</p>}
            <p># of seats left to select: {childrenTicket + adultTicket + seniorTicket - seatsSelected.length}</p>
            <div className="seats">
              <Button className="seat-button" variant="contained" color={seatsSelected.includes("A1") ? "primary" : "secondary"}  onClick={() => updateSeatsSelected("A1")}>
                A1
              </Button>
              <Button className="seat-button" variant="contained" color={seatsSelected.includes("A2") ? "primary" : "secondary"} onClick={() => updateSeatsSelected("A2")}>
                A2
              </Button>
              <Button className="seat-button" variant="contained" color={seatsSelected.includes("A3") ? "primary" : "secondary"} onClick={() => updateSeatsSelected("A3")}>
                A3
              </Button>
              <Button className="seat-button" variant="contained" color={seatsSelected.includes("A4") ? "primary" : "secondary"} onClick={() => updateSeatsSelected("A4")}>
                A4
              </Button>
              <Button className="seat-button" variant="contained" color={seatsSelected.includes("A5") ? "primary" : "secondary"} onClick={() => updateSeatsSelected("A5")}>
                A5
              </Button>
              <Button className="seat-button" variant="contained" color={seatsSelected.includes("A6") ? "primary" : "secondary"} onClick={() => updateSeatsSelected("A6")}>
                A6
              </Button>
              <Button className="seat-button" variant="contained" color={seatsSelected.includes("B1") ? "primary" : "secondary"} onClick={() => updateSeatsSelected("B1")}>
                B1
              </Button>
              <Button className="seat-button" variant="contained" color={seatsSelected.includes("B2") ? "primary" : "secondary"} onClick={() => updateSeatsSelected("B2")}>
                B2
              </Button>
              <Button className="seat-button" variant="contained" color={seatsSelected.includes("B3") ? "primary" : "secondary"} onClick={() => updateSeatsSelected("B3")}>
                B3
              </Button>
              <Button className="seat-button" variant="contained" color={seatsSelected.includes("B4") ? "primary" : "secondary"} onClick={() => updateSeatsSelected("B4")}>
                B4
              </Button>
              <Button className="seat-button" variant="contained" color={seatsSelected.includes("B5") ? "primary" : "secondary"} onClick={() => updateSeatsSelected("B5")}>
                B5
              </Button>
              <Button className="seat-button" variant="contained" color={seatsSelected.includes("B6") ? "primary" : "secondary"} onClick={() => updateSeatsSelected("B6")}>
                B6
              </Button>
              <Button className="seat-button" variant="contained" color={seatsSelected.includes("C1") ? "primary" : "secondary"} onClick={() => updateSeatsSelected("C1")}>
                C1
              </Button>
              <Button className="seat-button" variant="contained" color={seatsSelected.includes("C2") ? "primary" : "secondary"} onClick={() => updateSeatsSelected("C2")}>
                C2
              </Button>
              <Button className="seat-button" variant="contained" color={seatsSelected.includes("C3") ? "primary" : "secondary"} onClick={() => updateSeatsSelected("C3")}>
                C3
              </Button>
              <Button className="seat-button" variant="contained" color={seatsSelected.includes("C4") ? "primary" : "secondary"} onClick={() => updateSeatsSelected("C4")}>
                C4
              </Button>
              <Button className="seat-button" variant="contained" color={seatsSelected.includes("C5") ? "primary" : "secondary"} onClick={() => updateSeatsSelected("C5")}>
                C5
              </Button>
              <Button className="seat-button" variant="contained" color={seatsSelected.includes("C6") ? "primary" : "secondary"} onClick={() => updateSeatsSelected("C6")}>
                C6
              </Button>
              <Button className="seat-button" variant="contained" color={seatsSelected.includes("D1") ? "primary" : "secondary"} onClick={() => updateSeatsSelected("D1")}>
                D1
              </Button>
              <Button className="seat-button" variant="contained" color={seatsSelected.includes("D2") ? "primary" : "secondary"} onClick={() => updateSeatsSelected("D2")}>
                D2
              </Button>
              <Button className="seat-button" variant="contained" color={seatsSelected.includes("D3") ? "primary" : "secondary"} onClick={() => updateSeatsSelected("D3")}>
                D3
              </Button>
              <Button className="seat-button" variant="contained" color={seatsSelected.includes("D4") ? "primary" : "secondary"} onClick={() => updateSeatsSelected("D4")}>
                D4
              </Button>
              <Button className="seat-button" variant="contained" color={seatsSelected.includes("D5") ? "primary" : "secondary"} onClick={() => updateSeatsSelected("D5")}>
                D5
              </Button>
              <Button className="seat-button" variant="contained" color={seatsSelected.includes("D6") ? "primary" : "secondary"} onClick={() => updateSeatsSelected("D6")}>
                D6
              </Button>
              <Button className="seat-button" variant="contained" color={seatsSelected.includes("E1") ? "primary" : "secondary"} onClick={() => updateSeatsSelected("E1")}>
                E1
              </Button>
              <Button className="seat-button" variant="contained" color={seatsSelected.includes("E2") ? "primary" : "secondary"} onClick={() => updateSeatsSelected("E2")}>
                E2
              </Button>
              <Button className="seat-button" variant="contained" color={seatsSelected.includes("E3") ? "primary" : "secondary"} onClick={() => updateSeatsSelected("E3")}>
                E3
              </Button>
              <Button className="seat-button" variant="contained" color={seatsSelected.includes("E4") ? "primary" : "secondary"} onClick={() => updateSeatsSelected("E4")}>
                E4
              </Button>
              <Button className="seat-button" variant="contained" color={seatsSelected.includes("E5") ? "primary" : "secondary"} onClick={() => updateSeatsSelected("E5")}>
                E5
              </Button>
              <Button className="seat-button" variant="contained" color={seatsSelected.includes("E6") ? "primary" : "secondary"} onClick={() => updateSeatsSelected("E6")}>
                E6
              </Button>
            </div>

            <br/>

            <Button variant="contained"
              onClick={() => {
                if (seatsSelected.length === (childrenTicket + adultTicket + seniorTicket)) {
                  setStep(3);
                } else {
                  setError(true);
                  setErrorMessage("Select seats for all tickets.")
                }
              }}
              className="next-button">
              Next
            </Button>
          </> :

          <>
            <h2>Confirm Booking Details</h2>
            <div className="booking-details">
              <p><strong>Movie:</strong> {decodeURIComponent(movieTitle)}</p>
              <p><strong>Showtime:</strong> {decodeURIComponent(time)}</p>
              <p><strong>Seats:</strong> {seatsSelected.join(", ")}</p>
              <p><strong>Children:</strong> {childrenTicket}</p>
              <p><strong>Adults:</strong> {adultTicket}</p>
              <p><strong>Seniors:</strong> {seniorTicket}</p>
              
              <div className="confirmation-buttons">
                <Button variant="contained" onClick={() => {
                  setStep(2);
                }}>Go Back</Button>

                <Button variant="contained" onClick={() => {
                  // proceedToPayment();
                  localStorage.removeItem("bookingData");
                  window.location.href = "/checkout";
                }}>Checkout</Button>
              </div>

            </div>
          </>
        }
      </div>
    </div>
  );
}

export default withAuth(Page, [0,2]);
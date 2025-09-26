"use client";

import React, { useState } from "react";
import "./Booking.css";
import BackButton from "./BackButton";

const seatLayout = [
  ["A1", "A2", "A3", "A4", "A5", "A6"],
  ["B1", "B2", "B3", "B4", "B5", "B6"],
  ["C1", "C2", "C3", "C4", "C5", "C6"],
  ["D1", "D2", "D3", "D4", "D5", "D6"],
];

const unavailableSeats = ["A3", "B2", "C5"];
const accessibleSeats = ["D1", "D2"];

const ticketPrices = {
  adult: 12,
  child: 8,
  senior: 10,
};

const Booking = () => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [tickets, setTickets] = useState({ adult: 0, child: 0, senior: 0 });

const toggleSeat = (seat) => {
    if (unavailableSeats.includes(seat)) return;
    
    setSelectedSeats((prev) =>
        prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]
    );
};

const updateTicket = (type, change) => {
    setTickets((prev) => ({
      ...prev,
      [type]: Math.max(prev[type] + change, 0),
    }));
};

const totalTickets = tickets.adult + tickets.child + tickets.senior;
const totalCost =
    tickets.adult * ticketPrices.adult +
    tickets.child * ticketPrices.child +
    tickets.senior * ticketPrices.senior;

return (
    <div className="booking-container">
      {/* 1. Back Button Row (Aligned left) */}
      <div className="back-button-row">
        <BackButton />
      </div>

      {/* 2. Centered Main Title */}
      <h2 className="main-title-center">Book Your Seats</h2>
    
      {/* 3. Left Panel: Movie & Showtime Info + Ticket Adder */}
      <div className="three-column-content">
        <div className="left-panel">
          <h2>The Godfather</h2>
          <p>Showtime: 5:00 PM</p>

          <div className="ticket-adder">
            <h3>Select Tickets</h3>
            {Object.keys(ticketPrices).map((type) => (
              <div key={type} className="ticket-row">
                <span className="ticket-label">{type}</span>
                <div className="ticket-controls">
                  <button onClick={() => updateTicket(type, -1)}>-</button>
                  <span>{tickets[type]}</span>
                  <button onClick={() => updateTicket(type, 1)}>+</button>
                </div>
                <span className="ticket-price">${ticketPrices[type]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="seating-area">
          <div className="screen">SCREEN</div>
          <div className="seats">
            {seatLayout.map((row, rowIndex) => (
              <div key={rowIndex} className="seat-row">
                {row.map((seat) => {
                  let seatClass = "seat";
                  if (unavailableSeats.includes(seat)) seatClass += " unavailable";
                  else if (accessibleSeats.includes(seat)) seatClass += " accessible";
                  else if (selectedSeats.includes(seat)) seatClass += " selected";

                  return (
                    <div
                      key={seat}
                      className={seatClass}
                      onClick={() => toggleSeat(seat)}
                    >
                      {seat}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="legend">
            <div><span className="seat available"></span> Available</div>
            <div><span className="seat unavailable"></span> Unavailable</div>
            <div><span className="seat accessible"></span> Accessible</div>
            <div><span className="seat selected"></span> Selected</div>
          </div>
        </div>

        <div className="summary-box">
          <h3>Summary</h3>
          <p>Tickets: {totalTickets}</p>
          <p>Total: ${totalCost}</p>
          <p>Seats: {selectedSeats.join(", ") || "None"}</p>
          <button className="checkout-btn">Proceed</button>
        </div>
      </div>
    </div>
  );
};

export default Booking;
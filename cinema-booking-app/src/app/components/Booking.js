"use client";
import React from "react";
import "./Booking.css";

export default function Booking(prop) {
  return (
    <div className="booking">
      <h1>Booking</h1>
      <h2>Movie</h2>
      <p>{prop.movieTitle}</p>
      <h2>Time</h2>
      <p>{prop.time}</p>
    </div>
  );
}

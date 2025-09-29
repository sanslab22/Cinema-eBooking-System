"use client";
import React from "react";
import "./Booking.css";
import { Button } from "@mui/material";
import BackButton from "./BackButton";

export default function Booking(prop) {
  return (
    <div className="booking">
      <BackButton />
      <h1>Booking</h1>
      <h2>Movie</h2>
      <p>{prop.movieTitle}</p>
      <h2>Time</h2>
      <p>{prop.time}</p>

      <br />
      
      <Button className="card-button" variant="contained" color="primary">
        Book Now
      </Button>
    </div>
  );
}

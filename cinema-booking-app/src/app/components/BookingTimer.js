"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function BookingTimer({ expiryTimestamp }) {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(
    expiryTimestamp ? expiryTimestamp - Date.now() : 0
  );

  //  Release all seats 
  const releaseAllSeats = async () => {
    const showID = localStorage.getItem("showID");
    if (!showID) return;

    try {
      await fetch(`http://localhost:3002/api/showSeats/${showID}/releaseAll`, {
        method: "POST",
      });
    } catch (err) {
      console.error("Failed to release seats:", err);
    }
  };

  useEffect(() => {
    if (!expiryTimestamp) return;

    const interval = setInterval(async () => {
      const now = Date.now();
      const distance = expiryTimestamp - now;

      if (distance <= 0) {
        clearInterval(interval);
        setTimeLeft(0);

        alert("Your booking session expired.");

        await releaseAllSeats();

        // Clear booking persistence
        localStorage.removeItem("bookingData");
        localStorage.removeItem("showID");
        localStorage.removeItem("noAvailableSeats");

        router.push("/");
      } else {
        setTimeLeft(distance);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiryTimestamp]);

  if (!timeLeft) return null;

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  return (
    <div
      style={{
        top: "20px",
        right: "20px",
        backgroundColor: "#d32f2f",
        color: "white",
        padding: "10px 20px",
        borderRadius: "8px",
        fontWeight: "bold",
        zIndex: 9999,
        boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
        position: "relative",
        display: "inline-block",
      }}
    >
      Time Remaining: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
    </div>
  );
}

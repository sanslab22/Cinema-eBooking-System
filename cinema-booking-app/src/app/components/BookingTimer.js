"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BookingTimer({ expiryTimestamp, onExpire }) {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(
    expiryTimestamp ? expiryTimestamp - new Date().getTime() : 0
  );

  useEffect(() => {
    if (!expiryTimestamp) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = expiryTimestamp - now;

      if (distance < 0) {
        clearInterval(interval);
        if (typeof onExpire === "function") onExpire();
        localStorage.removeItem("bookingData");
        alert("Session Expired! Please restart your booking.");
        router.push("/"); // Redirect to home
      } else {
        setTimeLeft(distance);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiryTimestamp, router]);

  if (!timeLeft) return null;

  // Format time as MM:SS
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return (
    <div style={{
      top: "20px",
      right: "20px",
      backgroundColor: "#d32f2f",
      color: "white",
      padding: "10px 20px",
      borderRadius: "8px",
      fontWeight: "bold",
      zIndex: 9999,
      boxShadow: "0 4px 6px rgba(0,0,0,0.2)"
    }}>
      Time Remaining: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
    </div>
  );
}
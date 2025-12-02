"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "../../components/BackButton";
import { Button } from "@mui/material";
import "../page.css";

const formatCurrency = (val) => `$${Number(val || 0).toFixed(2)}`;

const BookingConfirmation = () => {
  const router = useRouter();
  const [data, setData] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("bookingConfirmation");
    if (!stored) {
      router.push("/");
      return;
    }
    setData(JSON.parse(stored));
  }, [router]);

  if (!data) return null;

  const { bookingId, movieTitle, showTime, seatsSelected, items, subtotal, discountAmount, total, promoCode, maskedCard } = data;

  return (
    <div className="checkout-page-wrapper">
      <BackButton route="/" />
      <h1 className="checkout-title">Booking Confirmed</h1>
      <div className="section-card" style={{ maxWidth: 800, margin: "0 auto" }}>
        <h2>Booking Details</h2>
        <div style={{ marginBottom: 12 }}>
          <strong>Booking ID:</strong> {bookingId}
        </div>
        <div style={{ marginBottom: 12 }}>
          <strong>Movie:</strong> {movieTitle}
        </div>
        <div style={{ marginBottom: 12 }}>
          <strong>Showtime:</strong> {showTime}
        </div>
        <div style={{ marginBottom: 12 }}>
          <strong>Seats:</strong> {seatsSelected?.join(", ")}
        </div>

        <h3>Order Summary</h3>
        <div>
          {items?.map((it) => (
            <div key={it.type} className="receipt-row">
              <span>{it.type} x {it.count}</span>
              <span>{formatCurrency(it.subtotal)}</span>
            </div>
          ))}
        </div>
        <div className="receipt-row">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {discountAmount ? (
          <div className="receipt-row">
            <span>Discount {promoCode ? `(${promoCode})` : ""}</span>
            <span>-{formatCurrency(discountAmount)}</span>
          </div>
        ) : null}
        <div className="receipt-total" style={{ marginTop: 8 }}>
          <span>Total Paid</span>
          <span>{formatCurrency(total)}</span>
        </div>

        <h3 style={{ marginTop: 18 }}>Payment</h3>
        <div className="receipt-row">
          <span>Paid with</span>
          <span>{maskedCard || "Saved Card"}</span>
        </div>

        <div style={{ marginTop: 20, display: "flex", gap: 8 }}>
          <Button variant="contained" onClick={() => { router.push('/'); }}>
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;

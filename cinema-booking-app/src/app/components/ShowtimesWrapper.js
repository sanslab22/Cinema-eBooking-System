"use client";

import React, { useState, useEffect, useMemo } from "react";
import "./ShowtimeWrapper.css"; // Make sure to create this file
import { useRouter } from "next/navigation";

export default function ShowtimesWrapper({ movie, movieId }) {
  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, []);

  const formatDateKey = (dateObj) => dateObj.toISOString().slice(0, 10);

  const [selectedDate, setSelectedDate] = useState(formatDateKey(new Date()));
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const formatShowtime = (startTime) => {
    const date = new Date(startTime);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  useEffect(() => {
    const fetchShowtimes = async () => {
      const idToUse = movieId || movie?.id;
      if (!selectedDate || !idToUse) return;

      setLoading(true);
      setError(null);

      const apiUrl = `http://localhost:3002/api/movies/${idToUse}/showtimes?showdate=${selectedDate}`;

      try {
        const response = await fetch(apiUrl, { cache: "no-store" });

        if (!response.ok) {
          throw new Error(`Unavailable`);
        }

        const data = await response.json();
        setShowtimes(data.showtimes || []);
      } catch (e) {
        console.error("Fetch error:", e);
        setError("Could not load times");
        setShowtimes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchShowtimes();
  }, [selectedDate, movieId, movie]);
  
  const router = useRouter();

  return (
    <div className="showtimes-container">
      <div className="section-header">
        <h3>Select a Date</h3>
      </div>

      <div className="date-scroller">
        {availableDates.map((date) => {
          const dateKey = formatDateKey(date);
          const isActive = selectedDate === dateKey;
          const dayName = date.toLocaleDateString("en-US", {
            weekday: "short",
          });
          const dayNum = date.getDate();

          return (
            <button
              key={dateKey}
              onClick={() => setSelectedDate(dateKey)}
              className={`date-card ${isActive ? "active" : ""}`}
            >
              <span className="day-name">{dayName}</span>
              <span className="day-num">{dayNum}</span>
            </button>
          );
        })}
      </div>

      <div className="section-header">
        <h3>Available Times</h3>
      </div>

      {loading && (
        <div className="loading-skeleton">
          <div className="skeleton-chip"></div>
          <div className="skeleton-chip"></div>
          <div className="skeleton-chip"></div>
        </div>
      )}

      {error && (
        <div className="state-message error">
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && showtimes.length === 0 && (
        <div className="state-message empty">
          <span>No screenings available for this date.</span>
        </div>
      )}

      {!loading && !error && showtimes.length > 0 && (
        <div className="showtimes-grid">
          {showtimes.map((timeSlot) => (
            <button
              key={timeSlot.id || timeSlot.showStartTime}
              className="time-btn"
              onClick={() => {
                router.push(
                  `/booking/${movie.movieTitle}/${selectedDate}+${timeSlot.showStartTime}`
                );
              }}
            >
              <span className="time-text">
                {formatShowtime(timeSlot.showStartTime)}
              </span>
              <span className="format-text">Standard</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

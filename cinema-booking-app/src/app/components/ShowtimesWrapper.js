"use client";

import React, { useState, useEffect, useMemo } from "react";
import "./ShowtimeWrapper.css";
import { useRouter } from "next/navigation";

export default function ShowtimesWrapper({ movie, movieId }) {
  const TZ = "Etc/GMT+5";

  const availableDates = useMemo(() => {
    const keys = [];
    const seen = new Set();
    const now = Date.now();
    for (let i = 0; i < 14; i++) {
      const d = new Date(now + i * 24 * 60 * 60 * 1000);
      const key = d.toLocaleDateString("en-CA", { timeZone: TZ });
      if (!seen.has(key)) {
        seen.add(key);
        keys.push(key);
      }
    }
    return keys;
  }, []);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("en-CA", { timeZone: TZ })
  );
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const formatShowtime = (startTime) => {
    const date = new Date(startTime);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: TZ,
    });
  };

  const formatShowtimeForUrl = (startTime) => {
    const date = new Date(startTime);
    const sv = date.toLocaleString("sv", { timeZone: TZ });
    const trimmed = sv.slice(0, 16).replace(" ", "T");
    return trimmed;
  };

  useEffect(() => {
    const fetchShowtimes = async () => {
      const idToUse = movieId || movie?.id;
      if (!selectedDate || !idToUse) return;

      setLoading(true);
      setError(null);
      const offset = "-05:00"; // for Etc/GMT+5 (UTC-5)
      const startIso = `${selectedDate}T00:00:00${offset}`;
      const endIso = `${selectedDate}T23:59:59${offset}`;

      const startUtcDate = new Date(startIso).toISOString().slice(0, 10);
      const endUtcDate = new Date(endIso).toISOString().slice(0, 10);

      // fetch showtimes for both UTC dates (may be same) and merge
      const datesToQuery = Array.from(new Set([startUtcDate, endUtcDate]));

      try {
        setLoading(true);
        console.debug("Fetching showtimes for UTC dates", { datesToQuery, selectedDate, TZ });

        const responses = await Promise.all(
          datesToQuery.map((d) =>
            fetch(`http://localhost:3002/api/movies/${idToUse}/showtimes?showdate=${d}`, {
              cache: "no-store",
            })
          )
        );

        const ok = responses.every((r) => r.ok);
        if (!ok) throw new Error("Unavailable");

        const arrays = await Promise.all(responses.map((r) => r.json()));
        const combined = arrays.flatMap((a) => a.showtimes || []);

        const filtered = combined.filter((s) => {
          try {
            const localDate = new Date(s.showStartTime).toLocaleDateString("en-CA", {
              timeZone: TZ,
            });
            return localDate === selectedDate;
          } catch (e) {
            return false;
          }
        });

        setShowtimes(filtered);
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
        {availableDates.map((dateKey) => {
          const isActive = selectedDate === dateKey;
          const [y, m, d] = dateKey.split("-").map((n) => parseInt(n, 10));
          const safeDate = new Date(Date.UTC(y, m - 1, d, 12));
          const dayName = safeDate.toLocaleDateString("en-US", {
            weekday: "short",
            timeZone: TZ,
          });
          const dayNum = safeDate.toLocaleDateString("en-US", {
            day: "numeric",
            timeZone: TZ,
          });

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
                if (timeSlot.id) {
                  localStorage.setItem("showID", timeSlot.id);
                  localStorage.setItem("auditoriumID", timeSlot.auditoriumID);
                  localStorage.setItem("noAvailableSeats", timeSlot.noAvailabileSeats || 0);
                }
                const timeForUrl = formatShowtimeForUrl(timeSlot.showStartTime);
                router.push(
                  `/booking/${movie.movieTitle}/${selectedDate}+${encodeURIComponent(
                    timeForUrl
                  )}`
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

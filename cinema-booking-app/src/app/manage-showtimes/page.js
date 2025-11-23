"use client";
import { Button } from "@mui/material";
import BackButton from "../components/BackButton";
import { useEffect, useState } from "react";
import "./page.css";

export default function ManageShowtimes() {

  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [newShowtime, setNewShowtime] = useState({
    showroom: "",
    date: "",
    time: "",
  });
  const [error, setError] = useState("");

  const showrooms = [
    { id: 1, name: "Screen A" },
    { id: 2, name: "Screen B" },
    { id: 3, name: "Grand Hall" },
  ];

  useEffect(() => {
    async function fetchMovies() {
      try {
        const response = await fetch("http://localhost:3002/api/movies");
        const data = await response.json();
        setMovies(data.items || data || []);
      } catch (err) {
        console.error("Error fetching movies: ", err);
      }
    }
    fetchMovies();
  }, []);

  useEffect(() => {
    if (!selectedMovie) return;
    async function fetchShowtimes() {
      try {
        const today = new Date().toISOString().split("T")[0];
        const response = await fetch(
          `/api/movies/${selectedMovie.id}/showtimes?showdate=${today}`
        );
        const data = await response.json();
        setShowtimes(data.showtimes || []);
      } catch (err) {
        console.error("Error fetching showtimes:", err);
      }
    }
    fetchShowtimes();
  }, [selectedMovie]);

  const handleAddShowtime = async () => {
    setError("");

    const { showroom, date, time } = newShowtime;
    if (!selectedMovie || !showroom || !date || !time) {
      setError("Please fill out all fields before adding a showtime.");
      return;
    }

    // 1. Create Local Date Object
    // We split strings to force "Local Time" usage
    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);
    // Note: Month is 0-indexed in JS
    const showStart = new Date(year, month - 1, day, hours, minutes);
    const now = new Date();

    if (showStart < now) {
      setError("You cannot schedule a showtime in the past.");
      return;
    }

    //conflict check
    const conflict = showtimes.some((s) => {
       const existingStart = new Date(s.showStartTime);
       return (
         s.auditoriumID === parseInt(showroom) && 
         existingStart.getTime() === showStart.getTime()
       );
    });

    if (conflict) {
      setError("A showtime already exists in this showroom at that time.");
      return;
    }

    // add showtime
    try {
      const response = await fetch(`http://localhost:3002/api/admin/movies/${selectedMovie.id}/shows`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          auditoriumID: parseInt(showroom),
          // We send the ISO string. The DB will store this as the Timestamp.
          showStartTime: showStart.toISOString(), 
        }),
      });

      if (!response.ok) {

        const errData = await response.json();
        throw new Error(errData.error || "Failed to save showtime");
      }

      const savedShow = await response.json();


      setShowtimes((prev) => [...prev, savedShow]);
      

      setNewShowtime({ ...newShowtime, time: "" }); 
      

    } catch (err) {
      console.error("Save error:", err);
      setError(err.message);
    }

  };

  return (
    <div className="manage-showtimes">
      <BackButton route="/admin-home" />
      <h2>Manage Showtimes</h2>

      <div className="movie-select-section">
        <label htmlFor="movieSelect">Select a Movie:</label>
        <select
          id="movieSelect"
          value={selectedMovie?.id || ""}
          onChange={(e) => {
              const movie = movies.find(
                (m) => m.id === parseInt(e.target.value)
              );
              setSelectedMovie(movie || null);
              setShowtimes([]);
          }}
        >
          <option value="">Choose a movie</option>
          {movies.map((movie) => (
              <option key={movie.id} value={movie.id}>
                {movie.movieTitle}
              </option>
          ))}
        </select>
      </div>

      {selectedMovie && (
        <>
        <div className="showtime-form">
          <h3>Add Showtime for "{selectedMovie.movieTitle}"</h3>
          <div className="form-row">
            <label>Showroom:</label>
            <select
              value={newShowtime.showroom}
              onChange={(e) =>
                setNewShowtime({...newShowtime, showroom: e.target.value})
              }
            >
              <option value="">Select Showroom</option>
              {showrooms.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label>Date:</label>
            <input 
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={newShowtime.date}
              onChange={(e) => 
                setNewShowtime({...newShowtime, date: e.target.value})
              }
            />
          </div>

          <div className="form-row">
            <label>Time:</label>
            <input 
              type="time"
              value={newShowtime.time}
              onChange={(e) => 
                setNewShowtime({...newShowtime, time: e.target.value})
              }
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button className="add-showtime-btn" onClick={handleAddShowtime}>
            Add Showtime
          </button>

        </div>

        <div className="showtime-list">
          <h3>Existing Showtimes</h3>
          {showtimes.length > 0 ? (
            <table className="showtime-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Showroom</th>
                  <th>Date/Time</th>
                </tr>
              </thead>
              <tbody>
                {showtimes.map((s) => (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>
                      {
                        showrooms.find(
                          (r) => r.id === s.auditoriumID
                        )?.name
                      }
                    </td>
                    <td>
                      {new Date(s.showStartTime).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No showtimes scheduled yet.</p>
          )}
        </div>
        </>
      )}
    </div>
  );
}
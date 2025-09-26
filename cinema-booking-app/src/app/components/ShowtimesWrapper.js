// components/ShowtimesWrapper.jsx
"use client";

import React, { useState, useEffect } from 'react';

// Define the ShowtimesWrapper component
export default function ShowtimesWrapper({ movie, movieId }) {
    
    // --- State for Date, Showtimes, Loading, and Error ---
    const [selectedDate, setSelectedDate] = useState(
        // Initialize with today's date in YYYY-MM-DD format
        new Date().toISOString().slice(0, 10) 
    );
    const [showtimes, setShowtimes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- Formatting Function (Same as before) ---
    const formatShowtime = (timeSlot) => {
        try {
            const start = new Date(timeSlot.startTime); 
            const end = new Date(timeSlot.endTime); 

            const formatTime = (date) => {
                return date.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                });
            };
            // Example: 01:00 PM - 04:23 PM
            return `${formatTime(start)} - ${formatTime(end)}`;
        } catch (e) {
            console.error("Error formatting showtime:", e, timeSlot);
            return "Time format error"; 
        }
    };
    
    // --- API Fetching Logic ---
    useEffect(() => {
        const fetchShowtimes = async () => {
            const idToUse = movieId; // Use movieId prop directly
            console.log("Fetching showtimes for movie ID:", idToUse, "on date:", selectedDate);
            if (!selectedDate || !idToUse) return; 

            setLoading(true);
            setError(null);
            
            // The API call is reliable here since movie.id is passed correctly
            // Use the correct query parameter name 'showdate'
            const apiUrl = `http://localhost:3000/api/movies/${idToUse}/showtimes?showdate=${selectedDate}`;

            try {
                const response = await fetch(apiUrl, { cache: 'no-store' });
                
                if (!response.ok) {
                    const errorDetails = await response.json().catch(() => ({ error: response.statusText }));
                    throw new Error(errorDetails.error || `Error fetching showtimes: ${response.statusText}`);
                }
                
                const data = await response.json();
                setShowtimes(data.showtimes || []); 

            } catch (e) {
                console.error("Fetch error:", e);
                setError(e.message);
                setShowtimes([]);
            } finally {
                setLoading(false);
            }
        };

        fetchShowtimes();
    }, [selectedDate, movie.id]); 

    const handleDateChange = (event) => {
        setSelectedDate(event.target.value);
    };

    // --- JSX Display (Styled) ---
    return (
        <div className="showtimes-section">
            <h3>Available Showtimes</h3>
            
            <div className="date-picker-container">
                <label htmlFor="showdate-input">Select Date:</label>
                <input 
                    id="showdate-input"
                    type="date" 
                    value={selectedDate} 
                    onChange={handleDateChange} 
                    className="showdate-input"
                />
            </div>

            {loading && <p className="loading-message">Fetching times...</p>}
            
            {error && <p className="error-message">🛑 {error}</p>}
            
            {!loading && !error && showtimes.length === 0 && (
                <p className="no-showtimes-message">No showtimes available :(</p>
            )}

            {!loading && !error && showtimes.length > 0 && (
                <div className="showtimes-grid">
                    {showtimes.map((timeSlot) => (
                        <button 

                            key={timeSlot.id || timeSlot.startTime} 
                            className="showtime-tile"
                            // Add booking functionality here


                        >
                            {formatShowtime(timeSlot)}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// NOTE: You still need the CSS from the previous answer in MovieDetails.css
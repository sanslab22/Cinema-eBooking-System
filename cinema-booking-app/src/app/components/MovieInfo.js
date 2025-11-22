"use client";

import Image from "next/image";
import "./MovieInfo.css";
import React, { useState, useEffect } from "react";
import { Button, Stack } from "@mui/material";
import { useRouter } from "next/navigation";

const MovieInfo = ({ movie }) => {
  const router = useRouter();

  const imageSrc = movie.imagePoster?.startsWith("/")
    ? movie.imagePoster
    : `/images/movies/${movie.imagePoster}`;

  const getEmbedUrl = (url) => {
    if (!url) return null;

    const urlObj = new URL(url);
    const videoId = urlObj.searchParams.get("v");
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const trailerUrl = getEmbedUrl(movie.trailerURL);

  // Group showtimes by date
  const showtimesByDate = (movie.showtimes || []).reduce((acc, showtime) => {
    const date = new Date(showtime).toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const time = new Date(showtime).toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    });

    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(time);
    return acc;
  }, {});

  const availableDates = Object.keys(showtimesByDate);
  // State to manage which date is selected
  const [selectedDate, setSelectedDate] = useState(availableDates[0] || null);

  return (
    <div className="movie-info">
      <div>
        <h1>{movie.movieTitle}</h1>
        <br />

        <Image
          src={imageSrc}
          alt={movie.movieTitle}
          width={200}
          height={300}
          className="movie-poster"
        />
      </div>
      <div className="movie-details">
        <br />
        <div className="trailer-container">
          <iframe
            width="560"
            height="315"
            src={trailerUrl}
            title={`${movie.movieTitle} Trailer`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
        </div>
        <h2>About</h2>
        <p>{movie.synopsis}</p>
        <p>
          <b>Rating:</b> {movie.filmRating}{" "}
        </p>

        <p>
          <b>Genre:</b> {movie.category}
        </p>
        <p>
          <b>Duration:</b> {movie.duration} minutes
        </p>

        {movie.isActive ? (
          <div>
            <p>
              <b>Available Showtimes</b>
            </p>
            {/* Date Selection Buttons */}
            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
              {availableDates.map((date) => (
                <Button
                  key={date}
                  variant={selectedDate === date ? 'contained' : 'outlined'}
                  onClick={() => setSelectedDate(date)}
                >
                  {date}
                </Button>
              ))}
            </Stack>

            {/* Time Selection Buttons for the selected date */}
            <Stack direction="row" spacing={2}>
              {selectedDate &&
                showtimesByDate[selectedDate].map((time, idx) => (
                  <Button
                    key={idx}
                    variant="outlined"
                    color="error"
                    onClick={() => {
                      const encodedTitle = encodeURIComponent(movie.movieTitle);
                      const encodedTime = encodeURIComponent(time);
                      // You might want to include the date in the URL in the future
                      router.push(`/booking/${encodedTitle}/${encodedTime}`);
                    }}
                  >
                    {time}
                  </Button>
                ))}
            </Stack>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default MovieInfo;

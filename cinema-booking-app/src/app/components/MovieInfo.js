"use client";

import Image from "next/image";
import "./MovieInfo.css";
import React, { useState, useEffect } from "react";
import { Button, Stack } from "@mui/material";
import { useRouter } from "next/navigation";

const MovieInfo = ({ movie }) => {
  const router = useRouter();

  const imageSrc = movie.movieImage?.startsWith("/")
    ? movie.movieImage
    : `/images/movies/${movie.movieImage}`;

  const getEmbedUrl = (url) => {
    if (!url) return null;

    const urlObj = new URL(url);
    const videoId = urlObj.searchParams.get("v");
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const trailerUrl = getEmbedUrl(movie.trailer);

  const times = ["12:00 pm", "5:00 pm", "10:00 pm"];

  return (
    <div className="movie-info">
      <div>
        <h1>{movie.title}</h1>
        <br />

        <Image
          src={imageSrc}
          alt={movie.title}
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
            title={`${movie.title} Trailer`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
        </div>
        <h2>About</h2>
        <p>{movie.description}</p>
        <p>
          <b>Rating:</b> {movie.movie_rating}{" "}
        </p>

        <p>
          <b>Genre:</b> {movie.genre}
        </p>
        <p>
          <b>Duration:</b> {movie.duration} minutes
        </p>

        {movie.isActive ? (
          <div>
            <p>
              <b>Available Showtimes for today</b>
            </p>
            <Stack direction="row" spacing={2}>
              {times.map((time, idx) => (
                <Button
                  key={idx}
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    const encodedTitle = encodeURIComponent(movie.title);
                    const encodedTime = encodeURIComponent(time);
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

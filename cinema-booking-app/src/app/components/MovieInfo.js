"use client";

import Image from "next/image";
import "./MovieInfo.css";
import React, { useState, useEffect } from 'react'; 
import { Button, Stack } from "@mui/material";
import { useRouter } from "next/navigation"; 

const MovieInfo = ({movie, children}) => {

    const router = useRouter();
    // Determine the correct image source
    // If movieImage is a full URL or starts with "/", use it directly; otherwise, prepend the images path

    const imageSrc = movie.movieImage?.startsWith("/")
    ? movie.movieImage
    : `/images/movies/${movie.movieImage}`;

// Helper function to convert the YouTube URL
    const getEmbedUrl = (url) => {
        if (!url) return null;
        
        const urlObj = new URL(url);
        const videoId = urlObj.searchParams.get("v");
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    };

    // Generate the embed URL for the trailer   

    const trailerUrl = getEmbedUrl(movie.trailer);

    const times = ["12:00 pm", "5:00 pm", "10:00 pm"];

    console.log("Generated embed URL:", trailerUrl);

    return (
        <div className="movie-info">
            <Image src={imageSrc} alt={movie.title} width={200} height={300} className="movie-poster" />

            <div className="movie-details">
                <h1>{movie.title}</h1>
                <p>Rating: {movie.movie_rating} </p>
                <p>{movie.description}</p>
                <p>Genre: {movie.genre}</p>
                <p>Duration: {movie.duration} minutes</p>
                
                <p>Available Showtimes for today</p>
                <Stack direction="row" spacing={2}>
                    {times.map((time, idx) => (
                        <Button
                        key={idx}
                        variant="outlined"
                        color="error"
                        onClick={() => {
                            if (time === "5:00 pm") {
                            router.push("/booking"); // ✅ go to Booking.js
                            } else {
                            console.log(`Clicked ${time}, no action set yet`);
                            }
                        }}
                        >
                        {time}
                        </Button>
                    ))}
                </Stack>

                
                <h3>Trailer</h3>
                    <div className="trailer-container">
                        {/* Use the converted trailerUrl in the iframe */}
                        <iframe 
                            width="560" 
                            height="315" 
                            src={trailerUrl} 
                            title={`${movie.title} Trailer`} 
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            referrerPolicy="strict-origin-when-cross-origin" 
                            allowFullScreen>
                        </iframe>
                    </div>
            </div>
        </div>
    );
};

export default MovieInfo;
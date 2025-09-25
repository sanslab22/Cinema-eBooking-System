"use client";

import Image from "next/image";
import "./MovieInfo.css";


const MovieInfo = ({movie}) => {
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

    console.log("Generated embed URL:", trailerUrl);

    return (
        <div className="movie-info">
            <Image src={imageSrc} alt={movie.title} width={300} height={450} className="movie-poster" />

            <div className="movie-details">
                <h1>{movie.title}</h1>
                <p>Rating: {movie.movie_rating} </p>
                <p>{movie.description}</p>
                <p>Genre: {movie.genre}</p>

                <h3>Available Showtimes</h3>
                <ul>
                    {Array.isArray(movie.showtimes) && movie.showtimes.map((time, id) => (
                        <li key={id}>{time}</li>
                    ))}
                </ul>

                
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
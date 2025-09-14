"use client";

import Image from "next/image";
import "./MovieInfo.css";
import { useParams } from "next/navigation"; 

const MovieInfo = ({ movie }) => {
    
    return (
        <div className="movie-info">
            <Image src={movie.img} alt={movie.title} width={300} height={450} className="movie-poster" />

            <div className="movie-details">
                <h1>{movie.title}</h1>
                <p>Rating: {movie.rating} </p>
                <p>{movie.description}</p>

                <h3>Available Showtimes</h3>
                <ul>
                    {movie.showtimes.map((time, idx) => (
                        <li key={idx}>{time}</li>
                    ))}
                </ul>

                <h3>Trailer</h3>
                <div className="trailer-container">
                <iframe width="560" height="315" src={movie.trailer} title={`${movie.title} Trailer`} frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                </div>
            </div>
        </div>
    );
};

export default MovieInfo;
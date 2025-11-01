"use client";

import { Button } from "@mui/material";
import "./page.css";
import Link from "next/link";
import { useState, useEffect } from "react";
import BackButton from "../components/BackButton";

export default function ManageMovies() {

    const [movie, setMovie] = useState({
        movieTitle: "",
        category: "",
        cast: "",
        director: "",
        producer: "",
        synopsis: "",
        trailerURL: "",
        filmRating: "",
        imagePoster: "",
        isActive: false,
    });
    
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setMovie((prev) => ({
          ...prev,
          [name]: type === "checkbox" ? checked : value,
        }));
    };
    
      const handleSubmit = async (e) => {
        e.preventDefault();
        setError(false);
        setSuccessMessage("");
    
        // Basic validation: ensure all fields are filled
        const missingField = Object.entries(movie).find(
          ([key, value]) => key !== "isActive" && value === ""
        );
        if (missingField) {
          setError(true);
          setErrorMessage(`Please fill in the ${missingField[0]} field.`);
          return;
        }
    
        try {
            const response = await fetch("http://localhost:3002/api/movies", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(movie),
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                throw new Error(data.message || "Failed to add movie");
            }
    
            setSuccessMessage("Movie added successfully!");
            setMovie({
                movieTitle: "",
                category: "",
                cast: "",
                director: "",
                producer: "",
                synopsis: "",
                trailerURL: "",
                filmRating: "",
                imagePoster: "",
                isActive: false,
            });
        } catch (err) {
          setError(true);
          setErrorMessage(err.message);
        }
      };

  return (
    <div className="manage-movies">
        <BackButton route="/admin-home" />
        <h1 className="title">Add New Movie</h1>
        <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{errorMessage}</div>}
            {successMessage && (
                <div className="error-message" style={{ backgroundColor: "green" }}>
                    {successMessage}
                </div>
            )}

            <label>
                Movie Title
                <input
                    type="text"
                    name="movieTitle"
                    value={movie.movieTitle}
                    onChange={handleChange}
                    required
                />
            </label>
            
            <label>
                Category
                <input
                    type="text"
                    name="category"
                    value={movie.category}
                    onChange={handleChange}
                    required
                />
            </label>

            <label>
                Cast
                <input
                    type="text"
                    name="cast"
                    value={movie.cast}
                    onChange={handleChange}
                    required
                />
            </label>

            <label>
                Director
                <input
                    type="text"
                    name="director"
                    value={movie.director}
                    onChange={handleChange}
                    required
                />
            </label>

            <label>
                Producer
                <input
                    type="text"
                    name="producer"
                    value={movie.producer}
                    onChange={handleChange}
                    required
                />
            </label>

            <label>
                Synopsis
                <textarea
                    name="synopsis"
                    rows="4"
                    value={movie.synopsis}
                    onChange={handleChange}
                    required
                />
            </label>

            <label>
                Trailer URL
                <input
                    type="text"
                    name="trailerURL"
                    value={movie.trailerURL}
                    onChange={handleChange}
                    required
                />
            </label>

            <label>
                Film Rating
                <input
                    type="text"
                    name="filmRating"
                    value={movie.filmRating}
                    onChange={handleChange}
                    required
                />
            </label>

            <label>
                Image Poster
                <input
                    type="text"
                    name="imagePoster"
                    value={movie.imagePoster}
                    onChange={handleChange}
                    required
                />
            </label>

            <label>
                <input
                    type="checkbox"
                    name="isActive"
                    value={movie.isActive}
                    onChange={handleChange}
                    required
                />{" "}
                Currently Playing?
            </label>

            <div className='button-container'>
                <Button>
                    Add Movie
                </Button>

            </div>

        </form>
        
    </div>
  )};

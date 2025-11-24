"use client";

import withAuth from "../hoc/withAuth";
import { Button } from "@mui/material";
import "./page.css";
import Link from "next/link";
import { useState, useEffect } from "react";
import BackButton from "../components/BackButton";

function ManageMovies() {
  const [movie, setMovie] = useState({
    movieTitle: "",
    category: "",
    cast: "",
    duration: "",
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
  const [showForm, setShowForm] = useState(false);
  const [showMovies, setShowMovies] = useState(false);
  const [movies, setMovies] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMovie((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await fetch("http://localhost:3002/api/movies");
      if (!response.ok) {
        throw new Error('Failed to fetch movies');
      }
      const data = await response.json();
      setMovies(data.items || []); // Ensure movies is always an array
      setShowMovies(true);
      setShowForm(false);
    } catch (error) {
      console.error("Error fetching movies:", error);
      setMovies([]); // On error, set to empty array to prevent crashes
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(false);
    setSuccessMessage("");

    // Basic validation: ensure all fields are filled
    const requiredFields = [
      "movieTitle",
      "category",
      "cast",
      "director",
      "producer",
      "synopsis",
      "filmRating",
      "imagePoster",
    ];

    for (const field of requiredFields) {
      if (!movie[field]) {
        setError(true);
        setErrorMessage(
          `Please fill in the ${field
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()} field.`
        );
        return;
      }
    }

    // Now, validate duration separately
    if (!movie.duration) {
      setError(true);
      setErrorMessage("Please fill in the duration field.");
      return;
    }

    if (
      !Number.isInteger(Number(movie.duration)) ||
      Number(movie.duration) <= 0
    ) {
      setError(true);
      setErrorMessage("Duration must be a valid, positive integer.");
      return;
    }

    const moviePayload = {
      ...movie,
      duration: Number(movie.duration), // convert to number for Prisma
    };
    console.log("Payload to send:", moviePayload);

    try {
      const response = await fetch("http://localhost:3002/api/admin/movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(moviePayload),
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
        duration: "",
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
      <h1 className="title">Manage Movies</h1>

      <div className="button-container">
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setShowForm(true);
            setShowMovies(false);
          }}
        >
          Add Movie
        </Button>
      </div>

      {showForm && (
        <>
          <h2 className="title">Add New Movie</h2>
          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{errorMessage}</div>}
            {successMessage && (
              <div
                className="error-message"
                style={{
                  backgroundColor: "green",
                  padding: "10px",
                  borderRadius: "5px",
                  margin: "3px",
                }}
              >
                {successMessage}
              </div>
            )}

            <div className="form-grid">
              <label>
                Movie Title *
                <input
                  type="text"
                  name="movieTitle"
                  value={movie.movieTitle}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Category *
                <input
                  type="text"
                  name="category"
                  value={movie.category}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Duration (minutes) *
                <input
                  type="text"
                  name="duration"
                  value={movie.duration}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Cast *
                <input
                  type="text"
                  name="cast"
                  value={movie.cast}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Director *
                <input
                  type="text"
                  name="director"
                  value={movie.director}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Producer *
                <input
                  type="text"
                  name="producer"
                  value={movie.producer}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Synopsis *
                <textarea
                  name="synopsis"
                  rows="4"
                  value={movie.synopsis}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Trailer URL *
                <input
                  type="text"
                  name="trailerURL"
                  value={movie.trailerURL}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Film Rating *
                <input
                  type="text"
                  name="filmRating"
                  value={movie.filmRating}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Image Poster *
                <input
                  type="text"
                  name="imagePoster"
                  value={movie.imagePoster}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>

            <div className="button-container">
              <Button type="submit" variant="contained" color="primary">
                Add Movie
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  setShowForm(false);
                  fetchMovies();
                }}
                style={{ marginLeft: "10px" }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </>
      )}

      {showMovies && (
        <>
          <h2 className="title">Existing Movies</h2>
          <table className="movies-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Director</th>
                <th>Duration (min)</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {movies.map((movie) => (
                <tr key={movie.id}>
                  <td>{movie.movieTitle}</td>
                  <td>{movie.category}</td>
                  <td>{movie.director}</td>
                  <td>{movie.duration}</td>
                  <td><Button
          variant="contained"
          color="primary"
          onClick={() => {
          }}
        >Edit</Button></td>
        <td><Button
          variant="contained"
          color="primary"
          onClick={() => {
          }}
        >Delete</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default withAuth(ManageMovies, [1]);

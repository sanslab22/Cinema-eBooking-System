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
  
  // These were already in your code, we will use them now:
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

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
      setMovies(data.items || []); 
      setShowMovies(true);
      setShowForm(false);
    } catch (error) {
      console.error("Error fetching movies:", error);
      setMovies([]); 
    }
  };

  // --- NEW FUNCTION: Clears form for adding a new movie ---
  const handleAddNew = () => {
    setMovie({
      movieTitle: "", category: "", cast: "", duration: "", director: "",
      producer: "", synopsis: "", trailerURL: "", filmRating: "", imagePoster: "", isActive: false,
    });
    setIsEditing(false); // Ensure we are NOT in edit mode
    setEditId(null);
    setError(false);
    setSuccessMessage("");
    setShowForm(true);
    setShowMovies(false);
  };

  // --- NEW FUNCTION: Populates form for editing ---
  const handleEditClick = (selectedMovie) => {
    // Populate state with the selected movie details
    setMovie({
      movieTitle: selectedMovie.movieTitle,
      category: selectedMovie.category,
      cast: selectedMovie.cast,
      duration: selectedMovie.duration,
      director: selectedMovie.director,
      producer: selectedMovie.producer,
      synopsis: selectedMovie.synopsis,
      trailerURL: selectedMovie.trailerURL,
      filmRating: selectedMovie.filmRating,
      imagePoster: selectedMovie.imagePoster,
      isActive: selectedMovie.isActive || false,
    });

    setEditId(selectedMovie.id); 
    setIsEditing(true);         
    setError(false);
    setSuccessMessage("");
    setShowForm(true);          
    setShowMovies(false);       
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this movie? This cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch("http://localhost:3002/api/admin/movies", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }), 
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete movie");
      }

      alert("Movie deleted successfully.");
      fetchMovies(); 
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(false);
    setSuccessMessage("");

    // Basic validation
    const requiredFields = [
      "movieTitle", "category", "cast", "director", "producer", 
      "synopsis", "filmRating", "imagePoster",
    ];

    for (const field of requiredFields) {
      if (!movie[field]) {
        setError(true);
        setErrorMessage(`Please fill in the ${field} field.`);
        return;
      }
    }

    if (!movie.duration) {
      setError(true);
      setErrorMessage("Please fill in the duration field.");
      return;
    }

    if (!Number.isInteger(Number(movie.duration)) || Number(movie.duration) <= 0) {
      setError(true);
      setErrorMessage("Duration must be a valid, positive integer.");
      return;
    }

    const moviePayload = {
      ...movie,
      duration: Number(movie.duration),
    };

    try {
      let response;

      // --- LOGIC CHANGE: Check if Adding or Editing ---
      if (isEditing) {
        // PUT Request (Edit)
        response = await fetch("http://localhost:3002/api/admin/movies", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editId, ...moviePayload }),
        });
      } else {
        // POST Request (Add)
        response = await fetch("http://localhost:3002/api/admin/movies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(moviePayload),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || (isEditing ? "Failed to update" : "Failed to add movie"));
      }

      setSuccessMessage(isEditing ? "Movie updated successfully!" : "Movie added successfully!");
      
      // If we just added a new movie, clear the form. 
      // If we edited, we might want to keep the data there so the user sees it saved.
      if (!isEditing) {
        setMovie({
          movieTitle: "", category: "", cast: "", duration: "", director: "",
          producer: "", synopsis: "", trailerURL: "", filmRating: "", imagePoster: "", isActive: false,
        });
      }
      
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
          onClick={handleAddNew} // Updated to call the reset function
        >
          Add Movie
        </Button>
      </div>

      {showForm && (
        <>
          {/* Change Title based on mode */}
          <h2 className="title">{isEditing ? "Edit Movie" : "Add New Movie"}</h2>
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
              {/* Change Button text based on mode */}
              <Button type="submit" variant="contained" color="primary">
                {isEditing ? "Save Changes" : "Add Movie"}
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
                  <td>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleEditClick(movie)} // Hooked up the new function here
                    >
                      Edit
                    </Button>
                  </td>
                  <td>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleDelete(movie.id)}
                    >
                      Delete
                    </Button>
                  </td>
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
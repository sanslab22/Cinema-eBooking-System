"use client";

import withAuth from "../hoc/withAuth";
import { Button } from "@mui/material";
import "./page.css";
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
      if (!response.ok) throw new Error('Failed to fetch movies');
      const data = await response.json();
      setMovies(data.items || []); 
      setShowMovies(true);
      setShowForm(false);
    } catch (error) {
      console.error("Error fetching movies:", error);
      setMovies([]); 
    }
  };

  const handleAddNew = () => {
    setMovie({
      movieTitle: "", category: "", cast: "", duration: "", director: "",
      producer: "", synopsis: "", trailerURL: "", filmRating: "", imagePoster: "", isActive: false,
    });
    setIsEditing(false); 
    setEditId(null);
    setError(false);
    setSuccessMessage("");
    setShowForm(true);
    setShowMovies(false);
  };

  const handleEditClick = (selectedMovie) => {
    setMovie({
      movieTitle: selectedMovie.movieTitle,
      category: selectedMovie.category,
      cast: selectedMovie.cast,
      duration: selectedMovie.duration,
      director: selectedMovie.director,
      producer: selectedMovie.producer,
      synopsis: selectedMovie.synopsis || "",
      trailerURL: selectedMovie.trailerURL || "",
      filmRating: selectedMovie.filmRating,
      imagePoster: selectedMovie.imagePoster || "",
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
    if (!window.confirm("Are you sure you want to delete this movie?")) return;

    try {
      // FIX: Matches router.delete("/admin/movies/:movieId")
      const response = await fetch(`http://localhost:3002/api/admin/movies/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });

      const text = await response.text(); 
      let data;
      try { data = JSON.parse(text); } catch(e) {}

      if (!response.ok) {
        throw new Error((data && data.message) || "Failed to delete movie");
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

    // 1. Client-side Validation
    const requiredFields = ["movieTitle", "category", "cast", "director", "producer", "synopsis", "filmRating", "imagePoster"];
    for (const field of requiredFields) {
      if (!movie[field]) {
        setError(true);
        setErrorMessage(`Please fill in the ${field} field.`);
        return;
      }
    }

    // 2. Prepare Payload
    const moviePayload = {
      ...movie,
      duration: Number(movie.duration), // Ensure this is a Number
    };

    try {
      let response;

      if (isEditing) {
        // EDIT MODE: PATCH request to /api/admin/movies/:id
        response = await fetch(`http://localhost:3002/api/admin/movies/${editId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(moviePayload),
        });
      } else {
        // ADD MODE: POST request to /api/admin/movies
        response = await fetch("http://localhost:3002/api/admin/movies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(moviePayload),
        });
      }

      // 3. Robust Response Handling
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        throw new Error("Server returned HTML (likely 404 or 500). Check console.");
      }

      if (!response.ok) {
        // LOGIC FIX: Check for 'errors' array from backend validator
        const backendError = 
          data.error || 
          data.message || 
          (data.errors ? Object.values(data.errors).join(", ") : null) || 
          (isEditing ? "Failed to update movie" : "Failed to add movie");
          
        throw new Error(backendError);
      }

      // 4. Success Handling
      setSuccessMessage(isEditing ? "Movie updated successfully!" : "Movie added successfully!");
      
      // If we are adding, clear the form. If editing, we leave it so you see the changes.
      if (!isEditing) {
        setMovie({
          movieTitle: "", category: "", cast: "", duration: "", director: "",
          producer: "", synopsis: "", trailerURL: "", filmRating: "", imagePoster: "", isActive: false,
        });
      } else {
        // Optional: Refresh the list in the background so the table updates
        fetchMovies(); 
      }

    } catch (err) {
      console.error("Submit Error:", err);
      setError(true);
      setErrorMessage(err.message);
    }
  };

  return (
    <div className="manage-movies">
      <BackButton route="/admin-home" />
      <h1 className="title">Manage Movies</h1>

      <div className="button-container">
        <Button variant="contained" color="primary" onClick={handleAddNew}>
          Add Movie
        </Button>
      </div>

      {showForm && (
        <>
          <h2 className="title">{isEditing ? "Edit Movie" : "Add New Movie"}</h2>
          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{errorMessage}</div>}
            {successMessage && <div className="error-message" style={{backgroundColor: "green", padding: "10px"}}>{successMessage}</div>}

            <div className="form-grid">
              <label>Movie Title * <input type="text" name="movieTitle" value={movie.movieTitle} onChange={handleChange} required /></label>
              <label>Category * <input type="text" name="category" value={movie.category} onChange={handleChange} required /></label>
              <label>Duration (minutes) * <input type="text" name="duration" value={movie.duration} onChange={handleChange} required /></label>
              <label>Cast * <input type="text" name="cast" value={movie.cast} onChange={handleChange} required /></label>
              <label>Director * <input type="text" name="director" value={movie.director} onChange={handleChange} required /></label>
              <label>Producer * <input type="text" name="producer" value={movie.producer} onChange={handleChange} required /></label>
              <label>Synopsis * <textarea name="synopsis" rows="4" value={movie.synopsis} onChange={handleChange} required /></label>
              <label>Trailer URL * <input type="text" name="trailerURL" value={movie.trailerURL} onChange={handleChange} required /></label>
              <label>Film Rating * <input type="text" name="filmRating" value={movie.filmRating} onChange={handleChange} required /></label>
              <label>Image Poster * <input type="text" name="imagePoster" value={movie.imagePoster} onChange={handleChange} required /></label>
            </div>

            <div className="button-container">
              <Button type="submit" variant="contained" color="primary">{isEditing ? "Save Changes" : "Add Movie"}</Button>
              <Button variant="outlined" color="secondary" onClick={() => { setShowForm(false); fetchMovies(); }} style={{ marginLeft: "10px" }}>Cancel</Button>
            </div>
          </form>
        </>
      )}

      {showMovies && (
        <>
          <h2 className="title">Existing Movies</h2>
          <table className="movies-table">
            <thead>
              <tr><th>Title</th><th>Category</th><th>Director</th><th>Duration</th><th>Edit</th><th>Delete</th></tr>
            </thead>
            <tbody>
              {movies.map((movie) => (
                <tr key={movie.id}>
                  <td>{movie.movieTitle}</td><td>{movie.category}</td><td>{movie.director}</td><td>{movie.duration}</td>
                  <td><Button variant="contained" color="primary" onClick={() => handleEditClick(movie)}>Edit</Button></td>
                  <td><Button variant="contained" color="error" onClick={() => handleDelete(movie.id)}>Delete</Button></td>
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
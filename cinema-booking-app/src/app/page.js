"use client";
import Navbar from "./components/Navbar";
import MovieList from "./components/MovieList";
import SearchBar from "./components/SearchBar";
import Genres from "./components/Genres";
import { useState, useEffect } from "react";
import "./globals.css";

export default function Home() {
  // Set up state to hold all movies, genres, etc.
  const [allMovies, setAllMovies] = useState([]);
  const [uniqueGenres, setUniqueGenres] = useState([]);

  const [genreSelected, setGenreSelected] = useState([]);
  // State to hold the current search query from the SearchBar
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch data from the API when the component loads
  useEffect(() => {
    fetch("http://localhost:3000/api/movies")
      .then((response) => response.json())
      .then((data) => {
        setAllMovies(data.items);

        // Calculate unique genres from the fetched data
        const allGenreStrings = data.items.map((movie) => movie.genre);
        const allIndividualGenres = allGenreStrings.flatMap((genreString) =>
          genreString.split(", ").map((g) => g.trim())
        );
        const unique = [...new Set(allIndividualGenres)];
        setUniqueGenres(unique.sort());
      })
      .catch((error) => console.error("Error fetching movies:", error));
  }, []); // Empty array means this effect runs only once

  // Filter movies based on selected genres and search query
  const filteredMovies = allMovies.filter((movie) => {
    const titleMatchesSearch = movie.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    // Genre filtering
    if (genreSelected.length > 0) {
      const movieGenres = movie.genre.split(", ").map((g) => g.trim());
      const matchesGenre = genreSelected.some((selected) =>
        movieGenres.includes(selected)
      );
      if (!matchesGenre) return false;
    }
    // Search filtering
    if (searchQuery.length > 0 && !titleMatchesSearch) {
      return false;
    }
    return true; // No filters applied, include all
  });

  //  Derive "Playing Now" and "Coming Soon" from the live data
  const moviesPlayingNow = filteredMovies.filter((movie) => movie.isActive);
  const moviesComingSoon = filteredMovies.filter((movie) => !movie.isActive);

  return (
    <div className="page">
      <div className="container">
        <div className="search-bar">
          <SearchBar query={searchQuery} setVal={setSearchQuery} />
        </div>
        <Genres
          genres={uniqueGenres}
          genreSelected={genreSelected}
          setList={setGenreSelected}
        />

        {searchQuery.length > 0 ? (
          <div>
            <h2 className="header">Currently Running</h2>

            {filteredMovies.filter((movie) => movie.isActive).length > 0 ? <MovieList
              movies={filteredMovies.filter((movie) => movie.isActive)}
              showButton={true}
            />: <p>No movies matching search</p>  }
            <h2 className="header">Coming Soon</h2>
            {filteredMovies.filter((movie) => !movie.isActive).length > 0 ? (
            <MovieList
              movies={filteredMovies.filter((movie) => !movie.isActive)}
              showButton={false}
            />): <p>No movies matching search</p>}
          </div>
        ) : (
          <div>
            <h2 className="header">Currently Running</h2>

            <MovieList movies={moviesPlayingNow} showButton={true} />
            <h2 className="header">Coming Soon</h2>
            <MovieList movies={moviesComingSoon} showButton={false} />
          </div>
        )}
      </div>
    </div>
  );
}

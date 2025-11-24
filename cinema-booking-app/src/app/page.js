"use client";
import Navbar from "./components/Navbar";
import MovieList from "./components/MovieList";
import SearchBar from "./components/SearchBar";
import Genres from "./components/Genres";
import { useState, useEffect } from "react";
import "./globals.css";
import "./page.css";
import withAuth from "./hoc/withAuth";

function Home() {
  // Set up state to hold all movies, genres, etc.
  const [allMovies, setAllMovies] = useState([]);
  const [uniqueGenres, setUniqueGenres] = useState([]);

  const [genreSelected, setGenreSelected] = useState([]);
  // State to hold the current search query from the SearchBar
  const [searchQuery, setSearchQuery] = useState("");
  // State for date range filter
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch data from the API when the component loads
  useEffect(() => {
    fetch("http://localhost:3002/api/movies")
      .then((response) => response.json())
      .then((data) => {
        setAllMovies(data.items);

        // Calculate unique genres from the fetched data
        const allGenreStrings = data.items.map((movie) => movie.category);
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
    const titleMatchesSearch = movie.movieTitle
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    // Date range filtering
    if (startDate && endDate && movie.releaseDate) {
      const movieReleaseDate = new Date(movie.releaseDate);
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Adjust end date to be the end of the day
      end.setHours(23, 59, 59, 999);

      if (movieReleaseDate < start || movieReleaseDate > end) {
        return false;
      }
    }
    // Genre filtering
    if (genreSelected.length > 0) {
      const movieGenres = movie.category.split(", ").map((g) => g.trim());
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
        <div className="filters-container">
          <div className="genre-filter-wrapper">
            <Genres
              genres={uniqueGenres}
              genreSelected={genreSelected}
              setList={setGenreSelected}
            />
          </div>
          <div className="date-range-filter">
            <label>
              Start Date:
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </label>
            <label>
              End Date:
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </label>
          </div>
        </div>

        {searchQuery.length > 0 ? (
          <div>
            <h2 className="header">Currently Running</h2>

            {filteredMovies.filter((movie) => movie.isActive).length > 0 ? <MovieList
              movies={filteredMovies.filter((movie) => movie.isActive)}
              showButton={false}
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

            <MovieList movies={moviesPlayingNow} showButton={false} />
            <h2 className="header">Coming Soon</h2>
            <MovieList movies={moviesComingSoon} showButton={false} />
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(Home, [0, 2]);
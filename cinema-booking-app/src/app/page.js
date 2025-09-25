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
  const [query, setQuery] = useState("");
  const [genreSelected, setGenreSelected] = useState([]);

  // Fetch data from the API when the component loads
  useEffect(() => {
    fetch('http://localhost:3000/api/movies')
      .then(response => response.json())
      .then(data => {
        console.log('API Data Received:', data); // Debugging log
        setAllMovies(data.items);

        // Calculate unique genres from the fetched data
        const allGenreStrings = data.items.map(movie => movie.genre);
        const allIndividualGenres = allGenreStrings.flatMap(genreString => 
          genreString.split(', ').map(g => g.trim())
        );
        const unique = [...new Set(allIndividualGenres)];
        setUniqueGenres(unique.sort());
      })
      .catch(error => console.error('Error fetching movies:', error));
  }, []); // Empty array means this effect runs only once

  // Filter movies based on selected genres and search query
  const filteredMovies = allMovies.filter(movie => {
    // Genre filtering
    if (genreSelected.length > 0) {
      const movieGenres = movie.genre.split(', ').map(g => g.trim());
      const matchesGenre = genreSelected.some(selected => movieGenres.includes(selected));
      if (!matchesGenre) return false;
    }
    // Search filtering
    if (query.length > 0) {
      return movie.title.toLowerCase().includes(query.toLowerCase());
    }
    return true; // No filters applied, include all
  });

  //  Derive "Playing Now" and "Coming Soon" from the live data
  const moviesPlayingNow = filteredMovies.filter(movie => movie.isActive);
  const moviesComingSoon = filteredMovies.filter(movie => !movie.isActive);


  // Genre filtering logic here as well
  // For now, search will work on all movies
  const searchResults = allMovies.filter((movie) =>
    movie.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="page">
      <div className="container">

        <div className="search-bar">
          <SearchBar query={query} setVal={setQuery} />
        </div>
        <Genres 
          genres={uniqueGenres} 
          genreSelected={genreSelected} 
          setList={setGenreSelected} 
        />

        {query.length > 0 ? (
          <h2 className="header">Search Results</h2>
        ) : (
          <h2 className="header">Currently Running</h2>
        )}

        {query.length > 0 ? (
          <MovieList movies={searchResults} />
        ) : (
          <div>
            <MovieList movies={moviesPlayingNow} />
            <h2 className="header">Coming Soon</h2>
            <MovieList movies={moviesComingSoon} />
          </div>
        )}
      </div>
    </div>
  );
}

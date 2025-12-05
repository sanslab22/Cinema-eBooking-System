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
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [moviesWithShowtimes, setMoviesWithShowtimes] = useState(new Set());

  const [genreSelected, setGenreSelected] = useState([]);
  // State to hold the current search query from the SearchBar
  const [searchQuery, setSearchQuery] = useState("");
  // State for date range filter
  const [showDate, setShowDate] = useState("");

  // Fetch data from the API when the component loads
  useEffect(() => {
    fetch("http://localhost:3002/api/movies")
      .then((response) => response.json())
      .then(async (data) => {
        setAllMovies(data.items);

        // Check for any showtimes for active movies
        const activeMovies = data.items.filter(m => m.isActive);
        const moviesWithAnyShowtimes = new Set();
        const today = new Date().toISOString().split('T')[0];

        await Promise.all(activeMovies.map(async (movie) => {
          const response = await fetch(`http://localhost:3002/api/movies/${movie.id}/showtimes?startDate=${today}`);
          const showtimes = await response.json();
          if (showtimes.showtimes && showtimes.showtimes.length > 0) {
            moviesWithAnyShowtimes.add(movie.id);
          }
        }));
        setMoviesWithShowtimes(moviesWithAnyShowtimes);


        setFilteredMovies(data.items);

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

  useEffect(() => {
    const applyFilters = async () => {
      let movies = allMovies;

      // Date range filtering
      if (showDate) {
        const moviesWithDateShowtimes = new Set();        
        const TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

        // This logic determines which UTC dates need to be queried to cover the user's selected local date.
        const date = new Date(`${showDate}T00:00:00`);
        const utcOffset = date.getTimezoneOffset() / 60;
        const offsetSign = utcOffset > 0 ? "-" : "+";
        const offsetHours = Math.abs(Math.floor(utcOffset)).toString().padStart(2, '0');
        const offsetMinutes = (Math.abs(utcOffset) % 1 * 60).toString().padStart(2, '0');
        const offset = `${offsetSign}${offsetHours}:${offsetMinutes}`;

        const startIso = `${showDate}T00:00:00${offset}`;
        const endIso = `${showDate}T23:59:59${offset}`;
  
        const startUtcDate = new Date(startIso).toISOString().slice(0, 10);
        const endUtcDate = new Date(endIso).toISOString().slice(0, 10);
  
        const datesToQuery = Array.from(new Set([startUtcDate, endUtcDate]));

        await Promise.all(
          allMovies.map(async (movie) => {
            const responses = await Promise.all(
              datesToQuery.map((d) =>
                fetch(`http://localhost:3002/api/movies/${movie.id}/showtimes?showdate=${d}`)
              )
            );

            const arrays = await Promise.all(responses.map((r) => r.json()));
            const combined = arrays.flatMap((a) => a.showtimes || []);

            const filtered = combined.filter((s) => {
              try {
                const localDate = new Date(s.showStartTime).toLocaleDateString("en-CA", { timeZone: TZ });
                return localDate === showDate;
              } catch (e) {
                return false;
              }
            });

            if (filtered.length > 0) {
              moviesWithDateShowtimes.add(movie.id);
            }
          })
        );
        movies = movies.filter(movie => moviesWithDateShowtimes.has(movie.id));
      }

      // Genre filtering
      if (genreSelected.length > 0) {
        movies = movies.filter((movie) => {
          const movieGenres = movie.category.split(", ").map((g) => g.trim());
          return genreSelected.some((selected) =>
            movieGenres.includes(selected)
          );
        });
      }

      // Search filtering
      if (searchQuery) {
        movies = movies.filter((movie) =>
          movie.movieTitle.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setFilteredMovies(movies);
    };

    applyFilters();
  }, [showDate, genreSelected, searchQuery, allMovies]);


  //  Derive "Playing Now" and "Coming Soon" from the live data
  const moviesPlayingNow = filteredMovies.filter(
    (movie) => movie.isActive && (showDate || moviesWithShowtimes.has(movie.id))
  );
  const moviesComingSoon = filteredMovies.filter(
    (movie) => !movie.isActive
  );

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
            <p>Filter by Show Date</p>
            <label>
              Date:
              <input type="date" value={showDate} onChange={(e) => setShowDate(e.target.value)} />
            </label>
          </div>
        </div>

        {(searchQuery.length > 0 || genreSelected.length > 0 || showDate.length > 0) ? (
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
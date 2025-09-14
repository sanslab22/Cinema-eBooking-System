"use client";
import Navbar from "./components/Navbar";
import MovieList from "./components/MovieList";
import SearchBar from "./components/SearchBar";
import Genres from "./components/Genres";
import { useState } from "react";
import "./globals.css";

var moviesPlayingNow = [
  {
    title: "Movie 1",
    img: "/film.jpg",
  },
  {
    title: "Movie 2",
    img: "/film.jpg",
  },
  {
    title: "Movie 3",
    img: "/film.jpg",
  },
  {
    title: "Movie 4",
    img: "/film.jpg",
  },
  {
    title: "Movie 5",
    img: "/film.jpg",
  },
  {
    title: "Movie 6",
    img: "/film.jpg",
  },
  {
    title: "Movie 7",
    img: "/film.jpg",
  },
];

var moviesComingSoon = [
  {
    title: "Movie 8",
    img: "/film.jpg",
  },
  {
    title: "Movie 9",
    img: "/film.jpg",
  },
  {
    title: "Movie 10",
    img: "/film.jpg",
  },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [genreSelected, setGenreSelected] = useState([]);
  var combined = moviesComingSoon.concat(moviesPlayingNow);
  return (
    <div className="page">
      <Navbar />

      <div className="container">
        
        <h1 className="title">Cinema E-Booking App</h1>

        <div className="search-bar">
          <SearchBar query={query} setVal={setQuery}/>
        </div>
        <Genres genreSelected={genreSelected} setList={setGenreSelected} />

        {query.length > 0 ? <h2 className="header">Search Results</h2> : <h2 className="header">Currently Running</h2>}

        {query.length > 0 ? (
          <MovieList
            movies={combined.filter((movie) =>
              movie.title.toLowerCase().includes(query.toLowerCase())
            )}
          />
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

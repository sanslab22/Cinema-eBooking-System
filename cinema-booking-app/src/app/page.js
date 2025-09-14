"use client";
import Navbar from "./components/Navbar";
import MovieList from "./components/MovieList";
import SearchBar from "./components/SearchBar";
import Genres from "./components/Genres";
import { useState } from "react";
import "./globals.css";

var moviesPlayingNow = [
  {
    id: 1,
    title: "Movie 1",
    img: "/film.jpg",
    img: "/film.jpg",
    rating: "PG",
    description: "This is a test description for Movie 4.",
    showtimes: ["1:00 PM", "4:00 PM", "7:00 PM"],
    trailer: "https://www.youtube.com/embed/aqz-KE-bpKQ",
  },
  {
    id: 2,
    title: "Movie 2",
    img: "/film.jpg",
    img: "/film.jpg",
    rating: "PG",
    description: "This is a test description for Movie 4.",
    showtimes: ["1:00 PM", "4:00 PM", "7:00 PM"],
    trailer: "https://www.youtube.com/embed/aqz-KE-bpKQ",
  },
  {
    id: 3,
    title: "Movie 3",
    img: "/film.jpg",
    img: "/film.jpg",
    rating: "PG",
    description: "This is a test description for Movie 4.",
    showtimes: ["1:00 PM", "4:00 PM", "7:00 PM"],
    trailer: "https://www.youtube.com/embed/aqz-KE-bpKQ",
  },
  {
    id: 4,
    title: "Movie 4",
    img: "/film.jpg",
    img: "/film.jpg",
    rating: "PG",
    description: "This is a test description for Movie 4.",
    showtimes: ["1:00 PM", "4:00 PM", "7:00 PM"],
    trailer: "https://www.youtube.com/embed/aqz-KE-bpKQ",
  },
  {
    id: 5,
    title: "Movie 5",
    img: "/film.jpg",
    img: "/film.jpg",
    rating: "PG",
    description: "This is a test description for Movie 4.",
    showtimes: ["1:00 PM", "4:00 PM", "7:00 PM"],
    trailer: "https://www.youtube.com/embed/aqz-KE-bpKQ",
  },
  {
    id: 6,
    title: "Movie 6",
    img: "/film.jpg",
    img: "/film.jpg",
    rating: "PG",
    description: "This is a test description for Movie 4.",
    showtimes: ["1:00 PM", "4:00 PM", "7:00 PM"],
    trailer: "https://www.youtube.com/embed/aqz-KE-bpKQ",
  },
  {
    id: 7,
    title: "Movie 7",
    img: "/film.jpg",
    img: "/film.jpg",
    rating: "PG",
    description: "This is a test description for Movie 4.",
    showtimes: ["1:00 PM", "4:00 PM", "7:00 PM"],
    trailer: "https://www.youtube.com/embed/aqz-KE-bpKQ",
  },
];

var moviesComingSoon = [
  {
    id: 8,
    title: "Movie 8",
    img: "/film.jpg",
    img: "/film.jpg",
    rating: "PG",
    description: "This is a test description for Movie 4.",
    showtimes: ["1:00 PM", "4:00 PM", "7:00 PM"],
    trailer: "https://www.youtube.com/embed/aqz-KE-bpKQ",
  },
  {
    id: 9,
    title: "Movie 9",
    img: "/film.jpg",
    img: "/film.jpg",
    rating: "PG",
    description: "This is a test description for Movie 4.",
    showtimes: ["1:00 PM", "4:00 PM", "7:00 PM"],
    trailer: "https://www.youtube.com/embed/aqz-KE-bpKQ",
  },
  {
    id: 10,
    title: "Movie 10",
    img: "/film.jpg",
    img: "/film.jpg",
    rating: "PG",
    description: "This is a test description for Movie 4.",
    showtimes: ["1:00 PM", "4:00 PM", "7:00 PM"],
    trailer: "https://www.youtube.com/embed/aqz-KE-bpKQ",
  },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [genreSelected, setGenreSelected] = useState([]);
  var combined = moviesComingSoon.concat(moviesPlayingNow);
  return (
    <div className="page">
      <div className="container">
        <h1 className="title">Cinema E-Booking App</h1>

        <div className="search-bar">
          <SearchBar query={query} setVal={setQuery} />
        </div>
        <Genres genreSelected={genreSelected} setList={setGenreSelected} />

        {query.length > 0 ? (
          <h2 className="header">Search Results</h2>
        ) : (
          <h2 className="header">Currently Running</h2>
        )}

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

"use client";
import Navbar from "../components/Navbar";
import MovieList from "../components/MovieList";
import Genres from "../components/Genres";
import { useState, useEffect } from "react";
import "./page.css";

// Helper components
const StatCard = ({ title, value, icon }) => (
  <div className="stat-card">
    <div className="stat-icon">{icon}</div>
    <div className="stat-content">
      <div className="stat-title">{title}</div>
      <div className="stat-value">{value.toLocaleString()}</div>
    </div>
  </div>
);

const QuickLink = ({ text, icon, onClick }) => (
  <button className="quick-link" onClick={onClick}>
    <div className="quick-link-icon">{icon}</div>
    <div className="quick-link-text">{text}</div>
  </button>
);

// Simulated API fetch
const fetchAdminStats = async () => ({
  totalBookings: 125,
  registeredUsers: 1836,
  runningMovies: 12,
  upcomingMovies: 6,
});

export default function Home() {
  // Set up state to hold all movies, genres, etc.
  const [allMovies, setAllMovies] = useState([]);
  const [uniqueGenres, setUniqueGenres] = useState([]);

  const [genreSelected, setGenreSelected] = useState([]);

  const [stats, setStats] = useState({
    totalBookings: 0,
    registeredUsers: 0,
    runningMovies: 0,
    upcomingMovies: 0,
  });

  // Fetch data from the API when the component loads
  useEffect(() => {
    
    //pulling from sample data located above, mimicking API call
    fetchAdminStats()
      .then((statsData) => {
        setStats(statsData);
      })
      .catch((err) => {
        console.error("Error fetching admin stats:", err);
      });



    fetch("http://localhost:3002/api/movies")
      .then((response) => response.json())
      .then((data) => {
        setAllMovies(data.items);
      })
      .catch((error) => console.error("Error fetching movies:", error));
  }, []); // Empty array means this effect runs only once

  //  Derive "Playing Now" and "Coming Soon" from the live data
  //const moviesPlayingNow = filteredMovies.filter((movie) => movie.isActive);
  //const moviesComingSoon = filteredMovies.filter((movie) => !movie.isActive);

  // Admin UI icons
  const IconBooking = "🎬";
  const IconUsers = "👤";
  const IconRunning = "🍿";
  const IconUpcoming = "🕒";
  const IconAddMovie = "+";
  const IconTicketPrice = "$";
  const IconPromotion = "📣";

  //need to correctly pull from DB
  const movieManagementList = allMovies.map((movie) => ({
    title: movie.title,
    genre: movie.genre,
    showtimes: "TBD", // Replace with showtimes logic
    status: movie.isActive ? "Now Playing" : "Coming Soon",
  }));

  return (
    <div className="page">
      <div className="container">     
          <div>
            
            <div className="stats-row">
              <StatCard title="Total Bookings" value={stats.totalBookings} icon={IconBooking} />
              <StatCard title="Registered Users" value={stats.registeredUsers} icon={IconUsers} />
              <StatCard title="Running Movies" value={stats.runningMovies} icon={IconRunning} />
              <StatCard title="Upcoming Movies" value={stats.upcomingMovies} icon={IconUpcoming} />
            </div>

            <div className="quick-links-panel">
              <h2 className="panel-header">Quick Links</h2>
              <QuickLink text="Add New Movie" icon={IconAddMovie} onClick={() => {}} />
              <QuickLink text="Update Ticket Prices" icon={IconTicketPrice} onClick={() => {}} />
              <QuickLink text="Create Promotion" icon={IconPromotion} onClick={() => {}} />
            </div>

            <div className="movie-management-panel">
              <h2 className="panel-header">Movie Management</h2>
              <table className="movie-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Genre</th>
                    <th>Showtimes</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {movieManagementList.map((movie, idx) => (
                    <tr key={idx}>
                      <td>{movie.title}</td>
                      <td>{movie.genre}</td>
                      <td>{movie.showtimes}</td>
                      <td>{movie.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        
      </div>
    </div>
  );
}

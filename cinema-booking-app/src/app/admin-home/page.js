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


export default function Home() {
  // Set up state to hold all movies, genres, etc.
  const [allMovies, setAllMovies] = useState([]);

  const [stats, setStats] = useState({
    totalBookings: 0,
    registeredUsers: 0,
    runningMovies: 0,
    upcomingMovies: 0,
  });

  // Format showtimes
  const formatShowtimes = (movie) => {
    if (!movie || !Array.isArray(movie.showtimes) || movie.showtimes.length === 0)
      return "No Showtimes";
  
    return movie.showtimes
      .map((s) =>
        new Date(s.showStartTime).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        })
      )
      .join(", ");
  };

  // Fetch data from the API when the component loads
  useEffect(() => {
    
    fetch("http://localhost:3002/api/movies")
      .then((response) => response.json())
      .then((data) => {
        setAllMovies(data.items);
      })
      .catch((error) => console.error("Error fetching movies:", error));
  }, []); // Empty array means this effect runs only once

  useEffect(() => {
    if (allMovies.length === 0) return;
  
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  
    Promise.all(
      allMovies.map((movie) =>
        fetch(`http://localhost:3002/api/movies/${movie.id}/showtimes?showdate=${today}`)
          .then((res) => res.json())
          .catch(() => ({ showtimes: [] }))
      )
    ).then((allShowtimeResponses) => {
      
      // attach showtimes to each movie
      const mapped = allMovies.map((movie, index) => ({
        ...movie,
        showtimes: allShowtimeResponses[index].showtimes || []
      }));
      console.log("Mapped movies with showtimes:", mapped);
  
      setAllMovies(mapped);
    });
  }, [allMovies.length]);
  
  // Fetch Customer Users for Stats
  useEffect(() => {
    fetch("http://localhost:3002/api/users")
      .then((res) => res.json())
      .then((data) => {
        if (!data.items) return;

        // Filter only customers
        const customers = data.items.filter(
          (u) => u.userTypeId === 2 // or use u.userType.name === "Customer"
        );

        setStats((prev) => ({
          ...prev,
          registeredUsers: customers.length,
        }));
      })
      .catch((err) => console.error("Error fetching users:", err));
  }, []);

  // Calculate movie counts for stats
  useEffect(() => {
    if (allMovies.length === 0) return;

    const running = allMovies.filter(m => m.isActive).length;
    const upcoming = allMovies.filter(m => !m.isActive).length;

    setStats(prev => ({
      ...prev,
      runningMovies: running,
      upcomingMovies: upcoming
    }));
  }, [allMovies]);

  // Admin UI icons
  const IconUsers = "👤";
  const IconRunning = "🍿";
  const IconUpcoming = "🕒";

  //need to correctly pull from DB
  const movieManagementList = allMovies.map((movie) => ({
    movieTitle: movie.movieTitle,
    category: movie.category,
    showtimes: "TBD", // Replace with showtimes logic
    status: movie.isActive ? "Now Playing" : "Coming Soon",
  }));

  return (
    <div className="page">
      <div className="container">     
          
          <div>
            
            <div className="stats-row">
              <StatCard title="Registered Users" value={stats.registeredUsers} icon={IconUsers} />
              <StatCard title="Running Movies" value={stats.runningMovies} icon={IconRunning} />
              <StatCard title="Upcoming Movies" value={stats.upcomingMovies} icon={IconUpcoming} />
            </div>

            <div className="main-content-container">

              <div className="movie-management-panel">
                <h2 className="panel-header">Movie Management</h2>
                <table className="movie-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Genre</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movieManagementList.map((movie, idx) => (
                      <tr key={idx}>
                        <td>{movie.movieTitle}</td>
                        <td>{movie.category}</td>
                        <td>{movie.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        
      </div>
    </div>
  );
}

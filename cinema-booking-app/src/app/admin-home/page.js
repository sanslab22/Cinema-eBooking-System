"use client";
import { useState, useEffect } from "react";
import "./page.css";
import Link from "next/link";

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

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    registeredUsers: 0,
    runningMovies: 0,
    upcomingMovies: 0,
  });

  const [allMovies, setAllMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsData = await fetchAdminStats();
        setStats(statsData);

        const response = await fetch("http://localhost:3000/api/movies");
        const data = await response.json();
        setAllMovies(data.items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading Admin Dashboard...</div>;

  
  const IconBooking = "🎬";
  const IconUsers = "👤";
  const IconRunning = "🍿";
  const IconUpcoming = "🕒";
  const IconAddMovie = "+";
  const IconTicketPrice = "$";
  const IconPromotion = "📣";

  const movieManagementList = allMovies.map((movie) => ({
    title: movie.title,
    category: movie.genre,
    showtimes: "TBD", // Replace with showtimes logic
    status: movie.isActive ? "Now Playing" : "Coming Soon",
  }));

  return (
    <div className="admin-page">
      {/* <header className="admin-header">
        <h1>Cinema E-Booking Admin</h1>
        <button className="log-out-btn">LOG OUT</button>
      </header> */}

      <div className="admin-tabs-container">
        <div className="admin-tabs">
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/movies">Movies</Link>
          <Link href="/admin/users">Users</Link>
          <Link href="/admin/tickets">Tickets</Link>
          <Link href="/admin/promotions">Promotions</Link>
          <Link href="/admin/settings">Settings</Link>
        </div>
      </div>

      <div className="admin-container">
        {/* Stats */}
        <div className="stats-row">
          <StatCard title="Total Booking" value={stats.totalBookings} icon={IconBooking} />
          <StatCard title="Registered Users" value={stats.registeredUsers} icon={IconUsers} />
          <StatCard title="Running Movies" value={stats.runningMovies} icon={IconRunning} />
          <StatCard title="Upcoming Movies" value={stats.upcomingMovies} icon={IconUpcoming} />
        </div>

        {/* Quick Links + Movie Table */}
        <div className="main-content-row">
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
                  <th>Category</th>
                  <th>Showtimes</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {movieManagementList.map((movie, idx) => (
                  <tr key={idx}>
                    <td>{movie.title}</td>
                    <td>{movie.category}</td>
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






/* export default function Home() {
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
  const moviesComingSoon = filteredMovies.filter((movie) => !movie.isActive); */
  
  // add adminNavbar below 'page', but has to override Root Layout
  /* return (
    <div className="page">
      <div className="container">
        {searchQuery.length > 0 ? (
          <div>
            <h2 className="header">Currently Running</h2>

            {filteredMovies.filter((movie) => movie.isActive).length > 0 ? (
              <MovieList
                movies={filteredMovies.filter((movie) => movie.isActive)}
                showButton={false}
              />
            ) : (
              <p>No movies matching search</p>
            )}
            <h2 className="header">Coming Soon</h2>
            {filteredMovies.filter((movie) => !movie.isActive).length > 0 ? (
              <MovieList
                movies={filteredMovies.filter((movie) => !movie.isActive)}
                showButton={false}
              />
            ) : (
              <p>No movies matching search</p>
            )}
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
 */
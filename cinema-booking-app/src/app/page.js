import Navbar from "./components/Navbar";
import MovieList from "./components/MovieList";

export default function Home() {
  return (
    <div className="page">
      <Navbar />

      <div className="container">
        <h1 className="title">Cinema E-Booking App</h1>

        <h2 className="header">Currently Running</h2>
        <MovieList />

        <h2 className="header">Coming Soon</h2>
        <MovieList />
      </div>
    </div>
  );
}

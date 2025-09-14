import MovieCard from "./MovieCard";
import "./MovieList.css";

const MovieList = (prop) => {
  return (
    <div className="movie-list">
      {prop.movies.map((movie, idx) => (
        <MovieCard key={idx} movie={movie} />
      ))}
    </div>
  );
};

export default MovieList;

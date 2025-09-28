import MovieCard from "./MovieCard";
import "./MovieList.css";

const MovieList = (prop) => {
  return (
    <div className="movie-list">
      {prop.movies.map((movie, id) => (
        <MovieCard key={id} movie={movie} showButton={prop.showButton} />
      ))}
    </div>
  );
};

export default MovieList;

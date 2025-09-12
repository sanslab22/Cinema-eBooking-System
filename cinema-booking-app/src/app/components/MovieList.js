import MovieCard from "./MovieCard";
import "./MovieList.css";

const MovieList = (prop) => {
  return (
    <div className="movie-list">
        {prop.movies && prop.movies.map((movie, index) =>
            <MovieCard key={index} movie={movie} />
        )}
    </div>
  );
};

export default MovieList;

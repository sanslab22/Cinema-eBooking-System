import MovieCard from "./MovieCard";
import "./MovieList.css";

const MovieList = () => {
    const movies = [
        { id: 1, title: "Movie 1", img: "/film.jpg" },
        { id: 2, title: "Movie 2", img: "/film.jpg" },
        { id: 3, title: "Movie 3", img: "/film.jpg" },
        { id: 4, title: "Movie 4", img: "/film.jpg" },
    ];

    return (
        <div className="movie-list">
            {movies.map((movie, idx) => (
                <MovieCard key={idx} movie={movie} />
            ))}

            <h2 id="view-more">View More</h2>
        </div>
    );
};

export default MovieList;

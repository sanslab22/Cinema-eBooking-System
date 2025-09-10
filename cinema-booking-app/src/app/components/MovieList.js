import MovieCard from './MovieCard';
import "./MovieList.css";

const MovieList = () => {
    return (
        <div className="movie-list">
            <MovieCard movie={{
                title: "Movie 1",
                img: "/film.jpg"
            }}/>
            <MovieCard  movie={{
                title: "Movie 2",
                img: "/film.jpg"
            }}/>
            <MovieCard  movie={{
                title: "Movie 3",
                img: "/film.jpg"
            }}/>
            
            <MovieCard  movie={{
                title: "Movie 4",
                img: "/film.jpg"
            }}/>
            
            <h2 id='view-more'>View More</h2>
        </div>
    );
}

export default MovieList;
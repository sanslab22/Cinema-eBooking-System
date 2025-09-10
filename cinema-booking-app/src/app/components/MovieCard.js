import "./MovieCard.css";
import Image from "next/image";

const MovieCard = ({ movie }) => {
    return (
        <div className="movie-card">
            <Image src={movie.img} alt={movie.title} width={200} height={300} className="movie-image" />
            <h3 className="movie-title">{movie.title}</h3>
        </div>
    );
}

export default MovieCard;
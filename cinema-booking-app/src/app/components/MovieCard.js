import "./MovieCard.css";
import Image from "next/image";
import Link from "next/link";

const MovieCard = ({ movie }) => {
    return (
        
        <Link href={`/movies/${movie.id}`} className="movie-card">
            <Image src={movie.img} alt={movie.title} width={200} height={300} className="movie-image" />
            <h3 className="movie-title">{movie.title}</h3>
        </Link>
    );
}

export default MovieCard;
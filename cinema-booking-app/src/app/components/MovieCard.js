import "./MovieCard.css";
import Image from "next/image";
import Link from "next/link";


const MovieCard = ({ movie }) => {
    // Ensure the path always starts with /
  const imageSrc = movie.movieImage?.startsWith("/")
    ? movie.movieImage
    : `/images/movies/${movie.movieImage}`;

    return (
        
        <Link href={`/movies/${movie.movie_id}`} className="movie-card">
      <Image
        src={imageSrc}
        alt={movie.title}
        width={200}
        height={300}
        className="movie-image"
      />
      <h3 className="movie-title">{movie.title}</h3>
    </Link>
    );
}

export default MovieCard;
import "./MovieCard.css";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";

const MovieCard = ({ movie }) => {
  // Ensure the path always starts with /
  const imageSrc = movie.movieImage?.startsWith("/")
    ? movie.movieImage
    : `/images/movies/${movie.movieImage}`;
  const router = useRouter();

  return (
    <div className="movie-card">
      <Image
        src={imageSrc}
        alt={movie.title}
        width={200}
        height={300}
        className="movie-img"
      />
      <h3 className="movie-title">{movie.title}</h3>

      <div className="button-group">
        <Button
          className="card-button"
          variant="contained"
          color="primary"
          onClick={() => {
            router.push(`/booking`);
          }}
        >
          Book Now
        </Button>
        <Button
          className="card-button"
          variant="contained"
          color="secondary"
          onClick={() => {
            router.push(`/movies/${movie.movie_id}`);
          }}
        >
          View Details
        </Button>
      </div>
    </div>
  );
};

export default MovieCard;
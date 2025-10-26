import "./MovieCard.css";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";

const MovieCard = (prop) => {
  // Ensure the path always starts with /
  const imageSrc = prop.movie.imagePoster?.startsWith("/")
    ? prop.movie.imagePoster
    : `/images/movies/${prop.movie.imagePoster}`;
  const router = useRouter();

  return (
    <div className="movie-card">
      <Image
        src={imageSrc}
        alt={prop.movie.movieTitle}
        width={200}
        height={300}
        className="movie-img"
      />
      <h3 className="movie-title">{prop.movie.movieTitle}</h3>

      <div className="button-group">
        {prop.showButton ? (
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
        ) : null}
        <Button
          className="card-button"
          variant="contained"
          color="secondary"
          onClick={() => {
            router.push(`/movies/${prop.movie.movie_id}`);
          }}
        >
          View Details
        </Button>
      </div>
    </div>
  );
};

export default MovieCard;

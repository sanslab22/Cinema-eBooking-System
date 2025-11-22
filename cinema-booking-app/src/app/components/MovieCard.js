import "./MovieCard.css";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";

const MovieCard = (prop) => {
  // Ensure the path always starts with /
// 2. Logic to determine Image Source
  const imageSrc = (poster) => {
    if (!poster) return ""; // Add a default placeholder path here if you have one

    // If it's a web URL (http/https) or already an absolute path (/), use it as is
    if (poster.startsWith("http") || poster.startsWith("/")) {
      return poster;
    }

    // Otherwise, assume it's a local filename and prepend the folder path
    return `/images/movies/${poster}`;
  };
  const router = useRouter();

  return (
    <div className="movie-card">
      <Image
        src={imageSrc(prop.movie.imagePoster)}
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
            router.push(`/movies/${prop.movie.id}`);
          }}
        >
          View Details
        </Button>
      </div>
    </div>
  );
};

export default MovieCard;

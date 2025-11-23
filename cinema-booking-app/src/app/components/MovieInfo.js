import "./MovieInfo.css";

export default function MovieInfo({ movie }) {
  if (!movie) {
    return <div>Loading movie details...</div>;
  }

  // Function to extract YouTube video ID from URL
  const getYouTubeID = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

    const imageSrc = (poster) => {
    if (!poster) return ""; // Add a default placeholder path here if you have one

    if (poster.startsWith("http") || poster.startsWith("/")) {
      return poster;
    }

    return `/images/movies/${poster}`;
  };

  const trailerVideoId = movie.trailerURL ? getYouTubeID(movie.trailerURL) : null;

  return (
    <div>
    <div className="movie-info-container">
      <div className="movie-header">
        <h1>{movie.movieTitle}</h1>
        <span className="movie-rating">{movie.filmRating}</span>
      </div>
      <br/>
      <p className="movie-category">Category: {movie.category}</p>

      <div className="movie-content">
        <div className="movie-poster">
          <img src={imageSrc(movie.imagePoster)} alt={`${movie.movieTitle} Poster`} />
        </div>
        <div className="movie-details">
          <h2>Synopsis</h2>
          <p>{movie.synopsis}</p>

          <h2>Cast</h2>
          <p>{movie.cast}</p>

          <h2>Director</h2>
          <p>{movie.director}</p>

          <h2>Producer</h2>
          <p>{movie.producer}</p>
        </div>
      </div>

      {trailerVideoId && (
        <div className="trailer-container">
          <h2>Trailer</h2>
          <iframe
            width="560"
            height="315"
            src={`https://www.youtube.com/embed/${trailerVideoId}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}
    </div>
    </div>
  );
}
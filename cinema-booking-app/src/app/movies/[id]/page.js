import "./MovieDetails.css";
import MovieInfo from "../../components/MovieInfo";
import Navbar from "../../components/Navbar";
import BackButton from "../../components/BackButton";

const testMovies = {
    1: {
        id: 1,
        title: "Weapons",
        img: "/film.jpg",
        rating: "PG-13",
        description: "Test description for movie 1, Weapons",
        showtimes: ["12:00 PM", "3:00 PM", "6:30 PM", "9:00 PM"],
        trailer: "https://www.youtube.com/embed/OpThntO9ixc?si=7a0JmEJvBx53wOdC"
    },

    2: {
        id: 2,
        title: "Movie 2",
        img: "/film.jpg",
        rating: "R",
        description: "This is a test description for Movie 2.",
        showtimes: ["1:00 PM", "4:00 PM", "7:00 PM"],
        trailer: "https://www.youtube.com/embed/aqz-KE-bpKQ"
      }
}

export default async function MovieDetails({ params }) {
    const { id } = await params;
    const movie = testMovies[id];

    return (
        <div className="movie-details-page">
            <Navbar />
            <BackButton />
            <MovieInfo movie={movie} />
        </div>
    );
}
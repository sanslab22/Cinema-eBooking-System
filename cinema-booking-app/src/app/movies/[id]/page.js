import "./MovieDetails.css";
import MovieInfo from "../../components/MovieInfo";
import Navbar from "../../components/Navbar";
import BackButton from "../../components/BackButton";
import { testMovies } from "../../data/testMovies";

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
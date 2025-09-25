import "./MovieDetails.css";
import { notFound } from "next/navigation";
import MovieInfo from "../../components/MovieInfo";
import BackButton from "../../components/BackButton";

// Get the data from the api from server.js using the GET a single movie by id endpoint without prisma
async function getMovie(id) {
    const res = await fetch(`http://localhost:3000/api/movies/${id}`, { cache: 'no-store' });

    if (!res.ok) {
        return null;
    }

    return res.json();
}




export default async function MovieDetails({ params }) {
    const { id } = params;
  

    const movie = await getMovie(id);
    return (
        <div className="movie-details-page">
            <BackButton />
            <MovieInfo movie={movie}  />
        </div>
    );
}
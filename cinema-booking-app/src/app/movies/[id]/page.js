import "./MovieDetails.css";
import { notFound } from "next/navigation";
import MovieInfo from "../../components/MovieInfo";
import BackButton from "../../components/BackButton";
import ShowtimesWrapper from "@/app/components/ShowtimesWrapper";

// Get the data from the api from server.js using the GET a single movie by id endpoint without prisma
async function getMovie(id) {
    const res = await fetch(`http://localhost:3002/api/movies/${id}`, { cache: 'no-store' });

    if (!res.ok) {
        return null;
    }

    return res.json();
}



export default async function MovieDetails({ params }) {
    const { id } = await params;  

    const movie = await getMovie(id);
    // console.log("The is the movie information for id: ", id, "with details: ", movie)
    return (
        <div className="movie-details-page">
            <BackButton />
            <MovieInfo movie={movie}  />
            <ShowtimesWrapper movie={movie} movieId={id} />
        </div>
    );
}
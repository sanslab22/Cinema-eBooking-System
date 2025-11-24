"use client"
import React, { useEffect, useState } from "react";
import "./MovieDetails.css";
import MovieInfo from "../../components/MovieInfo";
import BackButton from "../../components/BackButton";
import ShowtimesWrapper from "@/app/components/ShowtimesWrapper";
import withAuth from "@/app/hoc/withAuth";

// Get the data from the api from server.js using the GET a single movie by id endpoint without prisma
async function getMovie(id) {
    const res = await fetch(`http://localhost:3002/api/movies/${id}`);

    if (!res.ok) {
        return null;
    }

    return res.json();
}

function MovieDetails({ params }) {
    // Next.js may pass `params` as a Promise; unwrap with React.use()
    const routeParams = React.use(params);
    const { id } = routeParams;
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                setLoading(true);
                const data = await getMovie(id);
                if (mounted) {
                    setMovie(data);
                }
            } catch (err) {
                if (mounted) setError(err.message || "Failed to load movie");
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [id]);

    if (loading) return <div className="movie-details-page">Loading...</div>;
    if (error) return <div className="movie-details-page">Error: {error}</div>;
    if (!movie) return <div className="movie-details-page">Movie not found.</div>;

    return (
        <div className="movie-details-page">
            <BackButton />
            <MovieInfo movie={movie} />
            <ShowtimesWrapper movie={movie} movieId={id} />
        </div>
    );
}

export default withAuth(MovieDetails, [0, 2]);
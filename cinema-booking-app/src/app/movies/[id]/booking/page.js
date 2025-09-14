import MovieInfo from "../../../components/MovieInfo";
import  { testMovies } from "../../../data/testMovies"

export default function BookingPage({ params, searchParams }) {

    const movieId = params.id;
    const selectedTime = searchParams.time;

    const movie = testMovies[movieId];

    return (
        <div>
            <h1>Booking Page</h1>
            <h2>{movie.title}</h2>
            <p>Selected Showtime: {selectedTime}</p>

            <button>Confirm Booking</button>
        </div>
    );

}
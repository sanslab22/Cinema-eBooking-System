import "./MovieDetails.css";
import MovieInfo from "../../components/MovieInfo";
import Navbar from "../../components/Navbar";
import BackButton from "../../components/BackButton";

var movies = [
  {
    id: 1,
    title: "Movie 1",
    img: "/film.jpg",
    rating: "PG",
    description: "This is a test description for Movie 4.",
    showtimes: ["1:00 PM", "4:00 PM", "7:00 PM"],
    trailer: "https://www.youtube.com/embed/aqz-KE-bpKQ",
  },
  {
    id: 2,
    title: "Movie 2",
    img: "/film.jpg",
    rating: "PG",
    description: "This is a test description for Movie 4.",
    showtimes: ["1:00 PM", "4:00 PM", "7:00 PM"],
    trailer: "https://www.youtube.com/embed/aqz-KE-bpKQ",
  },
  {
    id: 3,
    title: "Movie 3",
    img: "/film.jpg",
    rating: "PG",
    description: "This is a test description for Movie 4.",
    showtimes: ["1:00 PM", "4:00 PM", "7:00 PM"],
    trailer: "https://www.youtube.com/embed/aqz-KE-bpKQ",
  },
  {
    id: 4,
    title: "Movie 4",
    img: "/film.jpg",
    rating: "PG",
    description: "This is a test description for Movie 4.",
    showtimes: ["1:00 PM", "4:00 PM", "7:00 PM"],
    trailer: "https://www.youtube.com/embed/aqz-KE-bpKQ",
  },
  {
    id: 5,
    title: "Movie 5",
    img: "/film.jpg",
    rating: "PG",
    description: "This is a test description for Movie 4.",
    showtimes: ["1:00 PM", "4:00 PM", "7:00 PM"],
    trailer: "https://www.youtube.com/embed/aqz-KE-bpKQ",
  },
  {
    id: 6,
    title: "Movie 6",
    img: "/film.jpg",
    rating: "PG",
    description: "This is a test description for Movie 4.",
    showtimes: ["1:00 PM", "4:00 PM", "7:00 PM"],
    trailer: "https://www.youtube.com/embed/aqz-KE-bpKQ",
  },
  {
    id: 7,
    title: "Movie 7",
    img: "/film.jpg",
    rating: "PG",
    description: "This is a test description for Movie 4.",
    showtimes: ["1:00 PM", "4:00 PM", "7:00 PM"],
    trailer: "https://www.youtube.com/embed/aqz-KE-bpKQ",
  },

  {
    id: 8,
    title: "Movie 8",
    img: "/film.jpg",
    rating: "PG",
    description: "This is a test description for Movie 4.",
    showtimes: ["1:00 PM", "4:00 PM", "7:00 PM"],
    trailer: "https://www.youtube.com/embed/aqz-KE-bpKQ",
  },
  {
    id: 9,
    title: "Movie 9",
    img: "/film.jpg",
    rating: "PG",
    description: "This is a test description for Movie 4.",
    showtimes: ["1:00 PM", "4:00 PM", "7:00 PM"],
    trailer: "https://www.youtube.com/embed/aqz-KE-bpKQ",
  },
  {
    id: 10,
    title: "Movie 10",
    img: "/film.jpg",
    rating: "PG",
    description: "This is a test description for Movie 4.",
    showtimes: ["1:00 PM", "4:00 PM", "7:00 PM"],
    trailer: "https://www.youtube.com/embed/aqz-KE-bpKQ",
  },
];


export default async function MovieDetails({ params }) {
    const { id } = await params;
    const movie = movies.find((m) => m.id === parseInt(id));

    return (
        <div className="movie-details-page">
            <BackButton />
            <MovieInfo movie={movie}  />
        </div>
    );
}
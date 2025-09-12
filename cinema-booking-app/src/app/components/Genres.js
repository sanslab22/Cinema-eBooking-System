import { Button } from "@mui/material";
import "./Genres.css";

const genres = [
  "Comedy",
  "Action",
  "Romance",
  "Youth",
  "Thriller",
  "Horror",
  "Drama",
  "Fantasy",
  "Animation",
  "Documentary",
];

const Genres = (prop) => {
  return (
    <div className="genres">
      <p>Filter by Genre:</p>
      {genres.map((genre, index) => {
        if (prop.genreSelected.includes(genre)) {
          return (
            <Button
              key={index}
              color="primary"
              variant="contained"
              onClick={() => {
                prop.setList(prop.genreSelected.filter((g) => g != genre));
              }}
            >
              {genre}
            </Button>
          );
        } else {
          return (
            <Button
              key={index}
              variant="outlined"
              onClick={() => {
                prop.setList([...prop.genreSelected, genre]);
              }}
            >
              {genre}
            </Button>
          );
        }
      })}
    </div>
  );
};

export default Genres;

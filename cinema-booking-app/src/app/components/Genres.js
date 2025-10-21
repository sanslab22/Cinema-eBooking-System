import { Button } from "@mui/material";
import "./Genres.css";

const Genres = ({ genres, genreSelected, setList }) => {
  return (
    <div className="genres-section">
      <h2 className="genres-title">Filter by Genre</h2>

      <div className="genres">
        {genres.map((genre, index) => {
          const isSelected = genreSelected.includes(genre);

          return (
            <Button
              key={index}
              variant={isSelected ? "contained" : "outlined"}
              className={`genre-btn ${isSelected ? "selected" : ""}`}
              onClick={() =>
                isSelected
                  ? setList(genreSelected.filter((g) => g !== genre))
                  : setList([...genreSelected, genre])
              }
            >
              {genre}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default Genres;

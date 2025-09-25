import { Button } from "@mui/material";
import "./Genres.css";



const Genres = (prop) => {
   // We'll destructure the props to make it cleaner
  const { genres, genreSelected, setList } = prop;

  
  return (
    <div className="genres">
      <p>Filter by Genre:</p>

      {genres.map((genre, index) => {
        if (genreSelected.includes(genre)) {
          return (
            <Button
              key={index}
              color="primary"
              variant="contained"
              onClick={() => {
                setList(genreSelected.filter((g) => g !== genre));
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
                setList([...genreSelected, genre]);
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

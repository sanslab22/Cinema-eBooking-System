"use client";
import { Button } from "@mui/material";
import Booking from "../components/Booking";
import { useParams } from "next/navigation";

export default function Page({ params }) {
  const { movieTitle, time } = useParams();
  console.log(params.movieTitle);
  return (
    <div>
      <h1>Book Tickets</h1>

      <div className="booking-container">
        {
          step == 1 ? <>
          <h2>Select Tickets</h2>
          <label>Children</label> <input type="number" placeholder="0"/>
          <label>Adults</label> <input type="number" placeholder="0"/>
          <label>Seniors</label> <input type="number" placeholder="0"/>
          <button>Next</button>
          </>
          : 
          <>
            <h2>Select Seats</h2>
            <div className="seats">
              <Button className="seat-button" variant="contained" color="primary">
                A1
              </Button>
              <Button className="seat-button" variant="contained" color="primary">
                A1
              </Button>
              <Button className="seat-button" variant="contained" color="primary">
                A1
              </Button>
              <Button className="seat-button" variant="contained" color="primary">
                A1
              </Button>
              <Button className="seat-button" variant="contained" color="primary">
                A1
              </Button>
              <Button className="seat-button" variant="contained" color="primary">
                A1
              </Button>
              <Button className="seat-button" variant="contained" color="primary">
                A1
              </Button>
              <Button className="seat-button" variant="contained" color="primary">
                A1
              </Button>
              <Button className="seat-button" variant="contained" color="primary">
                A1
              </Button>
              <Button className="seat-button" variant="contained" color="primary">
                A1
              </Button>
              <Button className="seat-button" variant="contained" color="primary">
                A1
              </Button>
              <Button className="seat-button" variant="contained" color="primary">
                A1
              </Button>
              <Button className="seat-button" variant="contained" color="primary">
                A1
              </Button>
              <Button className="seat-button" variant="contained" color="primary">
                A1
              </Button>
              <Button className="seat-button" variant="contained" color="primary">
                A1
              </Button>
              <Button className="seat-button" variant="contained" color="primary">
                A1
              </Button>
              <Button className="seat-button" variant="contained" color="primary">
                A1
              </Button>
              <Button className="seat-button" variant="contained" color="primary">
                A1
              </Button>
              <Button className="seat-button" variant="contained" color="primary">
                A1
              </Button>
              <Button className="seat-button" variant="contained" color="primary">
                A1
              </Button>
              <Button className="seat-button" variant="contained" color="primary">
                A1
              </Button>
              <Button className="seat-button" variant="contained" color="primary">
                A1
              </Button>
              <Button className="seat-button" variant="contained" color="primary">
                A1
              </Button>
              <Button className="seat-button" variant="contained" color="primary">
                A1
              </Button>
              <Button className="seat-button" variant="contained" color="primary">
                A1
              </Button>
              <Button className="seat-button" variant="contained" color="primary">
                A1
              </Button>
              <Button className="seat-button" variant="contained" color="primary">
                A1
              </Button>
              <Button className="seat-button" variant="contained" color="primary">
                A1
              </Button>
              <Button className="seat-button" variant="contained" color="primary">
                A1
              </Button>
              <Button className="seat-button" variant="contained" color="primary">
                A1
              </Button>
            </div>
          </>
        }
      </div>
    </div>
  );
}

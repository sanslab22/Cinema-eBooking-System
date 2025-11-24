"use client";
import { Button } from "@mui/material";
import { useParams } from "next/navigation";
import { useState } from "react";
import withAuth from "../hoc/withAuth";

function Page({ params }) {
  const { movieTitle, time } = useParams();
  const [step, setStep] = useState(1);
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
          <button onClick={() => setStep(2)}>Next</button>
          </>
          : 
          <>
            <h2>Select Seats</h2>
            <div className="seats">
              {/* Add your seat selection logic here */}
              <p>Seat selection is not implemented yet.</p>
            </div>
            <button onClick={() => setStep(1)}>Back</button>
          </>
        }
      </div>
    </div>
  );
}

export default Page;
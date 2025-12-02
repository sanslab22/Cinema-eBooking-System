import express from "express";
import { getTicketCategories, lockSeatTemp, releaseSeatTemp, releaseAllTempSeats, getPromotions, createBooking } from "../controllers/bookingController.js";

const router = express.Router();

router.get("/ticket-categories", getTicketCategories);

// Lock a specific seat to 'temp'
router.post("/showSeats/:showID/:seatID/temp", lockSeatTemp);

// Release a specific 'temp' locked seat back to 'available' if the user deselects it
router.post("/showSeats/:showID/:seatID/release", releaseSeatTemp);

// Release all temp seats for a show (when timer expiry)
router.post("/showSeats/:showID/releaseAll", releaseAllTempSeats);

router.get("/promotions", getPromotions);

router.post("/createBooking", createBooking);


export default router;

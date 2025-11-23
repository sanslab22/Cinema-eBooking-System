import express from "express";
import { getTicketCategories } from "../controllers/bookingController.js";

const router = express.Router();

router.get("/ticket-categories", getTicketCategories);

export default router;

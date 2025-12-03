// routes/adminRoutes.js
import express from "express";
import cors from "cors";
import {
  createMovie,
  updateMovie,
  setMovieStatus,
  deleteMovie, // <--- 1. IMPORT THIS
  // listMoviesAdmin,                // optional later
} from "../controllers/adminMovieController.js";
import {
  createShowForMovie,
  listShowsForMovie,
  deleteShow,
  getBookedSeatCount,
} from "../controllers/adminShowController.js";


import { 
  createPromotion, 
  listPromotions, 
  deletePromotion, // Import this
  updatePromotion  // Import this
} from "../controllers/adminPromotionController.js";

import { getSubscribedUserEmails } from "../controllers/adminUserController.js";

import * as ticketController from '../controllers/adminTicketController.js';

import { promoteUser, deleteUserById } from "../controllers/userController.js";

const router = express.Router();
router.use(express.json());
router.use(cors());

// --- Movies (Admin) ---
router.post("/admin/movies", createMovie);                 // Add Movie
router.patch("/admin/movies/:movieId", updateMovie);       // Edit Movie
router.patch("/admin/movies/:movieId/status", setMovieStatus); // Toggle isActive
router.delete("/admin/movies/:movieId", deleteMovie); // Delete Movie

// --- Shows (Admin) ---
router.post("/admin/movies/:movieId/shows", createShowForMovie);
router.get("/admin/movies/:movieId/shows", listShowsForMovie);
router.delete("/admin/shows/:showId", deleteShow);
router.get("/admin/shows/:showId/bookedseats", getBookedSeatCount);

// -- Promotions (Admin) ---
router.post("/admin/promotions", createPromotion);
router.get("/admin/promotions", listPromotions);
router.delete("/admin/promotions/:id", deletePromotion);
router.put("/admin/promotions/:id", updatePromotion);
router.get("/admin/subscribed-emails", getSubscribedUserEmails);

//-- Tickets (Admin) ---
router.get('/admin/tickets', ticketController.listTickets);
router.put('/admin/tickets/:id', ticketController.updateTicketPrice);


router.patch("/admin/users/:id/promote", promoteUser);
router.delete("/admin/users/:id", deleteUserById);

// (Optional later)
// router.get("/admin/movies", listMoviesAdmin);

export default router;

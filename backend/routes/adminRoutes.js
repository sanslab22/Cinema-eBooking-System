// routes/adminRoutes.js
import express from "express";
import cors from "cors";
import {
  createMovie,
  updateMovie,
  setMovieStatus,
  // listMoviesAdmin,                // optional later
} from "../controllers/adminMovieController.js";
import {
  createShowForMovie,
  listShowsForMovie,
  deleteShow,
} from "../controllers/adminShowController.js";
import { createPromotion, listPromotions } from "../controllers/adminPromotionController.js";

import { getSubscribedUserEmails } from "../controllers/adminUserController.js";

const router = express.Router();
router.use(express.json());
router.use(cors());

// --- Movies (Admin) ---
router.post("/admin/movies", createMovie);                 // Add Movie
router.patch("/admin/movies/:movieId", updateMovie);       // Edit Movie
router.patch("/admin/movies/:movieId/status", setMovieStatus); // Toggle isActive

// --- Shows (Admin) ---
router.post("/admin/movies/:movieId/shows", createShowForMovie);
router.get("/admin/movies/:movieId/shows", listShowsForMovie);
router.delete("/admin/shows/:showId", deleteShow);

// -- Promotions (Admin) ---
router.post("/admin/promotions", createPromotion);
router.get("/admin/promotions", listPromotions);
router.get("/admin/subscribed-emails", getSubscribedUserEmails);


// (Optional later)
// router.get("/admin/movies", listMoviesAdmin);

export default router;

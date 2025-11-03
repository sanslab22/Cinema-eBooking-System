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

// (Optional later)
// router.get("/admin/movies", listMoviesAdmin);

export default router;

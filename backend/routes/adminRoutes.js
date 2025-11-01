// routes/adminRoutes.js
import express from "express";
import cors from "cors";
import {
  createMovie,
  updateMovie,
  setMovieStatus,
  // listMoviesAdmin,                // optional later
} from "../controllers/adminMovieController.js";

const router = express.Router();
router.use(express.json());
router.use(cors());

// --- Movies (Admin) ---
router.post("/admin/movies", createMovie);                 // Add Movie
router.patch("/admin/movies/:movieId", updateMovie);       // Edit Movie
router.patch("/admin/movies/:movieId/status", setMovieStatus); // Toggle isActive

// (Optional later)
// router.get("/admin/movies", listMoviesAdmin);

export default router;

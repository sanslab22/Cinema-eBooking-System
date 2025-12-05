import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from 'cors';
import { getMovies, getMovieByID, getMovieShowtimes, getMovieReviews, getAllShowtimes } from "../controllers/moviesController.js";

const router = express.Router();
const prisma = new PrismaClient();

router.use(express.json());
router.use(cors());

// Health
router.get('/', (_req, res) => res.json({ status: 'ok' }));

// GET all movies (paginated)
router.get('/movies', getMovies);

// GET single movie by id
router.get('/movies/:id', getMovieByID);

// Retrieve showtimes based on movieID and exact showDate
router.get('/movies/:id/showtimes', getMovieShowtimes)

// Global error handler
router.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Reviews
router.get('/reviews', getMovieReviews);

router.get('/shows', getAllShowtimes);


export default router;

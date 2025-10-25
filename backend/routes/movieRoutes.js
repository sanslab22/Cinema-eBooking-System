import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from 'cors';

const router = express.Router();
const prisma = new PrismaClient();

router.use(express.json());
router.use(cors());
// router.use(cors({
//   origin: "http://localhost:3000",
//   credentials: true
// }));

// Health
router.get('/', (_req, res) => res.json({ status: 'ok' }));

// GET all movies (paginated)
router.get('/movies', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit ?? '50', 10);
    const offset = parseInt(req.query.offset ?? '0', 10);

    const [items, total] = await Promise.all([
      prisma.movie.findMany({
        skip: offset,
        take: limit,
        orderBy: { id: 'asc' },
      }),
      prisma.movie.count(),
    ]);

    res.json({ total, limit, offset, items });
  } catch (e) {
    next(e);
  }
});

// GET single movie by id
router.get('/movies/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const movie = await prisma.movie.findUnique({
      where: { id: id }
    });
    if (!movie) return res.status(404).json({ error: 'Not found' });
    res.json(movie);
  } catch (e) {
    next(e);
  }
});

// Retrieve showtimes based on movieID and exact showDate
router.get('/movies/:id/showtimes', async (req, res, next) => {
  try {
    const movieId = Number(req.params.id);
    if (Number.isNaN(movieId)) {
      return res.status(400).json({ error: 'Invalid movie id' });
    }

    const showdate = req.query.showdate || req.query.date;
    if (!showdate) {
      return res.status(400).json({ error: 'Missing showdate query param (YYYY-MM-DD)' });
    }

    // showdate format validation
    if (!/^\d{4}-\d{2}-\d{2}$/.test(showdate)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const start = new Date(`${showdate}T00:00:00.000Z`);
    const end = new Date(`${showdate}T23:59:59.999Z`);

    // uses MovieShow, filters by movieID and showStartTime within the day's range
    const showtimes = await prisma.movieShow.findMany({
      where: {
        movieID: movieId,
        showStartTime: {
          gte: start,
          lte: end
        }
      },
      orderBy: { showStartTime: 'asc' },
    });

    res.json({
      movieId,
      showdate,
      count: showtimes.length,
      showtimes,
    });
  } catch (e) {
    next(e);
  }
});


// Global error handler
router.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default router;

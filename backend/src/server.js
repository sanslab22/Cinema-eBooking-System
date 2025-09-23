// src/server.js (CommonJS)
const express = require('express');
const { PrismaClient } = require('@prisma/client');   // ✅ import Prisma
const app = express();
const prisma = new PrismaClient();                    // ✅ instantiate

app.use(express.json());

// Health
app.get('/', (_req, res) => res.json({ status: 'ok' }));

// GET all movies (optionally paginated)
app.get('/api/movies', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit ?? '50', 10);
    const offset = parseInt(req.query.offset ?? '0', 10);

    const [items, total] = await Promise.all([
      prisma.movies.findMany({
        skip: offset,
        take: limit,
        orderBy: { movie_id: 'asc' },   // adjust if you want a different sort
      }),
      prisma.movies.count(),
    ]);

    res.json({ total, limit, offset, items });
  } catch (e) {
    next(e);
  }
});

// (optional) GET a single movie by id
app.get('/api/movies/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const movie = await prisma.movies.findUnique({ where: { movie_id: id } });
    if (!movie) return res.status(404).json({ error: 'Not found' });
    res.json(movie);
  } catch (e) {
    next(e);
  }
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

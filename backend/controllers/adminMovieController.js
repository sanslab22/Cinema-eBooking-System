// controllers/adminMovieController.js
import prisma from "../prismaClient.js";
import { validateCreateMovie, validateUpdateMovie, validateStatusToggle } from "../utils/validators.js";

/**
 * POST /api/admin/movies
 * Create a Movie.
 */
export async function createMovie(req, res) {
  try {
    const { ok, errors, data } = validateCreateMovie(req.body);
    if (!ok) return res.status(400).json({ errors });

    const movie = await prisma.movie.create({
      data: {
        movieTitle:  data.movieTitle,
        category:    data.category,
        cast:        data.cast,
        director:    data.director,
        producer:    data.producer,
        synopsis:    data.synopsis ?? null,
        trailerURL:  data.trailerURL ?? null,
        filmRating:  data.filmRating,
        imagePoster: data.imagePoster ?? null,
        isActive:    data.isActive ?? true,
      },
    });

    return res.status(201).json(movie);
  } catch (err) {
    // Unique title conflict, etc.
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Movie with this title already exists." });
    }
    console.error("createMovie error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * PATCH /api/admin/movies/:movieId
 * Update Movie fields (partial).
 */
export async function updateMovie(req, res) {
  try {
    const movieId = Number(req.params.movieId);
    if (!Number.isInteger(movieId) || movieId <= 0) {
      return res.status(400).json({ error: "Invalid movieId" });
    }

    const { ok, errors, data } = validateUpdateMovie(req.body);
    if (!ok) return res.status(400).json({ errors });

    // Build partial update data
    const patch = {};
    for (const k of [
      "movieTitle","category","cast","director","producer",
      "synopsis","trailerURL","filmRating","imagePoster","isActive"
    ]) {
      if (k in data) patch[k] = data[k];
    }

    const movie = await prisma.movie.update({
      where: { id: movieId },
      data: patch,
    });

    return res.json(movie);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Movie not found." });
    }
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Movie with this title already exists." });
    }
    console.error("updateMovie error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * PATCH /api/admin/movies/:movieId/status
 * Toggle/Set isActive flag.
 * Body: { isActive: boolean }
 */
export async function setMovieStatus(req, res) {
  try {
    const movieId = Number(req.params.movieId);
    if (!Number.isInteger(movieId) || movieId <= 0) {
      return res.status(400).json({ error: "Invalid movieId" });
    }

    const { ok, errors, data } = validateStatusToggle(req.body);
    if (!ok) return res.status(400).json({ errors });

    const movie = await prisma.movie.update({
      where: { id: movieId },
      data: { isActive: !!data.isActive },
    });

    return res.json(movie);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Movie not found." });
    }
    console.error("setMovieStatus error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

// (Optional later)
// export async function listMoviesAdmin(req, res) { ... }

// controllers/adminShowController.js
import prisma from "../prismaClient.js";
import {
  validateCreateShow,
  validateListShowsQuery,
} from "../utils/validators.js";

/**
 * POST /api/admin/movies/:movieId/shows
 * Body: { auditoriumID: number, showStartTime: ISO string, noAvailabileSeats?: number, showID?: number }
 *
 * Notes:
 * - If noAvailabileSeats not provided, defaults to auditorium.noOfSeats.
 * - If showID not provided, it will be auto-generated (max(showID)+1).
 * - After creating the MovieShow row, we pre-generate ShowSeats = “available” for all seats in that auditorium.
 */
export async function createShowForMovie(req, res) {
  try {
    const movieId = Number(req.params.movieId);
    if (!Number.isInteger(movieId) || movieId <= 0) {
      return res.status(400).json({ error: "Invalid movieId" });
    }

    const { ok, errors, data } = validateCreateShow(req.body);
    if (!ok) return res.status(400).json({ errors });

    // ensure movie exists
    const movie = await prisma.movie.findUnique({ where: { id: movieId } });
    if (!movie) return res.status(404).json({ error: "Movie not found." });

    // ensure auditorium exists
    const auditorium = await prisma.auditorium.findUnique({
      where: { id: data.auditoriumID },
      include: { seats: { select: { id: true } } },
    });
    if (!auditorium) return res.status(404).json({ error: "Auditorium not found." });

    // default available seats to auditorium capacity
    const capacity = auditorium.noOfSeats;
    const noAvailabileSeats = data.noAvailabileSeats ?? capacity;

    // generate a showID if not provided
    let showID = data.showID;
    if (showID == null) {
      const agg = await prisma.movieShow.aggregate({ _max: { showID: true } });
      showID = (agg._max.showID ?? 0) + 1;
    }

    // create show + seat map in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const show = await tx.movieShow.create({
        data: {
          showID,
          movieID: movieId,
          auditoriumID: data.auditoriumID,
          showStartTime: new Date(data.showStartTime),
          noAvailabileSeats,
        },
      });

      // Pre-create ShowSeats for all seats in the auditorium, status "available"
      if (auditorium.seats.length > 0) {
        await tx.showSeats.createMany({
          data: auditorium.seats.map((s) => ({
            seatID: s.id,
            showID: show.id,   // NOTE: ShowSeats.showID references MovieShow.id
            status: "available",
          })),
        });
      }

      // return the fully joined show
      return tx.movieShow.findUnique({
        where: { id: show.id },
        include: {
          movie: { select: { id: true, movieTitle: true } },
          auditorium: {
            select: { id: true, AuditoriumName: true, theaterId: true },
          },
        },
      });
    });

    return res.status(201).json(result);
  } catch (err) {
    if (err.code === "P2002") {
      // hits composite unique (showID, movieID, auditoriumID, showStartTime)
      return res.status(409).json({ error: "Duplicate show constraint violated." });
    }
    console.error("createShowForMovie error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * GET /api/admin/movies/:movieId/shows?date=YYYY-MM-DD
 * If date provided, list shows on that calendar day; else list next 7 days by default.
 */
export async function listShowsForMovie(req, res) {
  try {
    const movieId = Number(req.params.movieId);
    if (!Number.isInteger(movieId) || movieId <= 0) {
      return res.status(400).json({ error: "Invalid movieId" });
    }

    const { ok, errors, filters } = validateListShowsQuery(req.query);
    if (!ok) return res.status(400).json({ errors });

    const where = { movieID: movieId };

    // If date is provided, restrict to that calendar day (UTC window)
    if (filters.date) {
      const start = new Date(`${filters.date}T00:00:00.000Z`);
      const end   = new Date(`${filters.date}T23:59:59.999Z`);
      where.showStartTime = { gte: start, lte: end };
    // Or, if an explicit from/to is provided, honor that
    } else if (filters.from || filters.to) {
      where.showStartTime = {};
      if (filters.from) where.showStartTime.gte = new Date(filters.from);
      if (filters.to)   where.showStartTime.lte = new Date(filters.to);
    }
    // else: NO time filter → return ALL shows for this movie

    const shows = await prisma.movieShow.findMany({
      where,
      orderBy: { showStartTime: "asc" },
      include: {
        auditorium: { select: { id: true, AuditoriumName: true, theaterId: true } },
      },
    });

    return res.json({ movieId, count: shows.length, shows });
  } catch (err) {
    console.error("listShowsForMovie error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * GET /api/admin/shows/:showId/booked-seats
 * Returns count of ShowSeats marked as "booked" for the MovieShow.id
 */
export async function getBookedSeatCount(req, res) {
  try {
    const showId = Number(req.params.showId);
    if (!Number.isInteger(showId) || showId <= 0) {
      return res.status(400).json({ error: "Invalid showId" });
    }

    const show = await prisma.movieShow.findUnique({ where: { id: showId } });
    if (!show) {
      return res.status(404).json({ error: "Show not found." });
    }

    const bookedSeats = await prisma.showSeats.count({
      where: { showID: showId, status: "booked" },
    });

    return res.json({ showId, bookedSeats });
  } catch (err) {
    console.error("getBookedSeatCount error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}


/**
 * DELETE /api/admin/shows/:showId
 * - :showId is MovieShow.id (NOT the custom showID field)
 * - Deletes ShowSeats first, then the MovieShow
 */
export async function deleteShow(req, res) {
  try {
    const showId = Number(req.params.showId);
    if (!Number.isInteger(showId) || showId <= 0) {
      return res.status(400).json({ error: "Invalid showId" });
    }

    await prisma.$transaction(async (tx) => {
      await tx.showSeats.deleteMany({ where: { showID: showId } });
      await tx.movieShow.delete({ where: { id: showId } });
    });

    return res.status(204).send();
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Show not found." });
    }
    console.error("deleteShow error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

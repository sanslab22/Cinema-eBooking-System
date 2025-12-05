import prisma from "../prismaClient.js";


export const getMovies = async (req, res, next) => {
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
};

export const getMovieByID = async (req, res, next) => {
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
};

export const getMovieShowtimes = async (req, res, next) => {
  try {
    const movieId = Number(req.params.id);
    if (Number.isNaN(movieId)) {
      return res.status(400).json({ error: 'Invalid movie id' });
    }

    const { showdate, startDate, endDate } = req.query;

    if (!showdate && !startDate) {
      return res.status(400).json({ error: 'Missing query param: showdate or startDate is required.' });
    }

    const whereClause = { movieID: movieId };
    const dateFilter = {};

    if (showdate) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(showdate)) {
        return res.status(400).json({ error: 'Invalid showdate format. Use YYYY-MM-DD' });
      }
      dateFilter.gte = new Date(`${showdate}T00:00:00.000Z`);
      dateFilter.lte = new Date(`${showdate}T23:59:59.999Z`);
    } else if (startDate) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
        return res.status(400).json({ error: 'Invalid startDate format. Use YYYY-MM-DD' });
      }
      dateFilter.gte = new Date(`${startDate}T00:00:00.000Z`);

      if (endDate) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
          return res.status(400).json({ error: 'Invalid endDate format. Use YYYY-MM-DD' });
        }
        dateFilter.lte = new Date(`${endDate}T23:59:59.999Z`);
      }
    }

    if (Object.keys(dateFilter).length > 0) {
      whereClause.showStartTime = dateFilter;
    }

    // uses MovieShow, filters by movieID and showStartTime within the day's range
    const showtimes = await prisma.movieShow.findMany({
      where: whereClause,
      orderBy: { showStartTime: 'asc' },
    });

    res.json({
      movieId,
      count: showtimes.length,
      showtimes,
    });
  } catch (e) {
    next(e);
  }
};

export const getMovieReviews = async (req, res) => {
  const { movieTitle } = req.query;
  try {
    const whereClause = movieTitle
      ? {
          where: {
            movieTitle: movieTitle,
          },
        }
      : {};

    const reviews = await prisma.review.findMany(whereClause);
    res.json(reviews);
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

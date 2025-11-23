import prisma from "../prismaClient.js";

export async function listAuditoriums(req, res) {
  try {
    const theaterId = req.query.theaterId ? Number(req.query.theaterId) : null;
    if (theaterId !== null && (!Number.isInteger(theaterId) || theaterId <= 0)) {
      return res.status(400).json({ error: "Invalid theaterId" });
    }

    const includeSeats = String(req.query.includeSeats || "").toLowerCase() === "true";

    const auditoriums = await prisma.auditorium.findMany({
      where: theaterId ? { theaterId } : undefined,
      orderBy: [{ theaterId: "asc" }, { AuditoriumName: "asc" }],
      include: {
        theater: { select: { id: true, theaterName: true } },
        _count: { select: { seats: true, movieShows: true } },
        ...(includeSeats && {
          seats: {
            select: { id: true, rowNum: true, colNum: true },
            orderBy: [{ rowNum: "asc" }, { colNum: "asc" }],
          },
        }),
      },
    });

    return res.json({ count: auditoriums.length, auditoriums });
  } catch (err) {
    console.error("listAuditoriums error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function getAuditoriumById(req, res) {
  try {
    const auditoriumId = Number(req.params.auditoriumId);
    if (!Number.isInteger(auditoriumId) || auditoriumId <= 0) {
      return res.status(400).json({ error: "Invalid auditoriumId" });
    }

    const includeSeats = String(req.query.includeSeats || "").toLowerCase() === "true";

    const auditorium = await prisma.auditorium.findUnique({
      where: { id: auditoriumId },
      include: {
        theater: { select: { id: true, theaterName: true } },
        _count: { select: { seats: true, movieShows: true } },
        ...(includeSeats && {
          seats: {
            select: { id: true, rowNum: true, colNum: true },
            orderBy: [{ rowNum: "asc" }, { colNum: "asc" }],
          },
        }),
      },
    });

    if (!auditorium) return res.status(404).json({ error: "Auditorium not found." });
    return res.json(auditorium);
  } catch (err) {
    console.error("getAuditoriumById error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

import prisma from "../prismaClient.js";

// GET /api/booking/ticket-categories
export const getTicketCategories = async (req, res) => {
  try {
    const categories = await prisma.ticketCategory.findMany({
      select: {
        id: true,
        name: true,
        price: true,
      },
      orderBy: { id: "asc" }
    });

    return res.status(200).json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error("Error fetching ticket categories:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve ticket categories"
    });
  }
};


/**
 * POST /api/showSeats/:showID/:seatID/temp
 * Set seat status to 'temp' if currently 'available', to lock the seat temporarily.
 */
export async function lockSeatTemp(req, res) {
  // console.log("lockSeatTemp request params:", req.params);
  // console.log("lockSeatTemp request body:", req.body);

  const showID = Number(req.params.showID);
  const seatID = Number(req.params.seatID);

  if (!showID || !seatID) {
    return res.status(400).json({ error: "Invalid showID or seatID" });
  }

  try {
    // Only update if currently available
    const updated = await prisma.showSeats.updateMany({
      where: {
        showID,
        seatID,
        status: "available",
      },
      data: {
        status: "temp",
      },
    });

    if (updated.count === 0) {
      // Seat was already booked or temp locked
      return res.status(409).json({ error: "Seat not available for temporary lock." });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("lockSeatTemp error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * POST /api/showSeats/:showID/:seatID/release
 * Release a 'temp' lock on a seat, setting status back to 'available'.
 */
export async function releaseSeatTemp(req, res) {
  // console.log("releaseSeatTemp request params:", req.params);
  // console.log("releaseSeatTemp request body:", req.body);

  const showID = Number(req.params.showID);
  const seatID = Number(req.params.seatID);

  if (!showID || !seatID) {
    return res.status(400).json({ error: "Invalid showID or seatID" });
  }

  try {
    // Only update if currently temp
    const updated = await prisma.showSeats.updateMany({
      where: {
        showID,
        seatID,
        status: "temp",
      },
      data: {
        status: "available",
      },
    });

    if (updated.count === 0) {
      return res.status(409).json({ error: "Seat is not held temporarily." });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("releaseSeatTemp error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * POST /api/showSeats/:showID/releaseAll
 * Release all temp locks for a user/session on the given show.
 * Here simplified to release all temp seats for the show - improve by user/session if needed.
 */
export async function releaseAllTempSeats(req, res) {
  // console.log("releaseAllTempSeats request params:", req.params);
  // console.log("releaseAllTempSeats request body:", req.body);

  const showID = Number(req.params.showID);

  if (!showID) {
    return res.status(400).json({ error: "Invalid showID" });
  }

  try {
    const updated = await prisma.showSeats.updateMany({
      where: {
        showID,
        status: "temp",
        // Optionally filter on user/session locks if implemented
      },
      data: {
        status: "available",
      },
    });

    return res.json({ success: true, released: updated.count });
  } catch (error) {
    console.error("releaseAllTempSeats error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function getPromotions(_req, res) {
  try {
    const items = await prisma.promotions.findMany({
      orderBy: { startDate: "asc" },
    });

    return res.json(items);
  } catch (err) {
    console.error("listPromotions error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function createBooking(req, res) {
  
}
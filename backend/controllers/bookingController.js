import prisma from "../prismaClient.js";
import { hashPassword } from "../utils/hashUtils.js";

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
   console.log("lockSeatTemp request params:", req.params);
   console.log("lockSeatTemp request body:", req.body);

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
  console.log("createBooking payload:", req.body);
  // Expected body:
  // { userID, showTimeID, seatsSelected: ['A1','B2'], noOfTickets, selectedCardId?, card?: { cardNo, expirationDate, nameOnCard, billingAddress }, saveCard?: boolean, promoID? }
  try {
    const {
      userID,
      showTimeID,
      seatsSelected,
      noOfTickets,
      selectedCardId,
      card,
      saveCard,
      promoID,
    } = req.body || {};

    if (!userID || !Number.isInteger(Number(userID)) || Number(userID) <= 0) {
      return res.status(400).json({ error: "Invalid userID" });
    }
    if (!showTimeID || !Number.isInteger(Number(showTimeID)) || Number(showTimeID) <= 0) {
      return res.status(400).json({ error: "Invalid showTimeID" });
    }
    const seats = Array.isArray(seatsSelected) ? seatsSelected : [];
    if (!seats.length || !Number.isInteger(Number(noOfTickets)) || noOfTickets <= 0) {
      return res.status(400).json({ error: "Invalid seats or ticket count" });
    }

    // transaction
    const result = await prisma.$transaction(async (tx) => {

      // 1) Resolve promoID: if none provided, upsert default NO_PROMO
      let usedPromoID = null;
      if (promoID && Number.isInteger(Number(promoID))) {
        const foundPromo = await tx.promotions.findUnique({ where: { id: Number(promoID) } });
        if (!foundPromo) {
          throw new Error("Invalid promoID");
        }
        usedPromoID = Number(promoID);
      } else {
        // Ensure a default NO_PROMOTION exists
        const now = new Date();
        const future = new Date();
        future.setFullYear(future.getFullYear() + 100);
        const [defaultPromo] = await tx.promotions.findMany({ where: { promoCode: 'NO_PROMOTION' }, take: 1 });
        if (!defaultPromo) {
          const created = await tx.promotions.create({ data: { promoCode: 'NO_PROMOTION', promoValue: '0', startDate: now, expirationDate: future } });
          usedPromoID = created.id;
        } else {
          usedPromoID = defaultPromo.id;
        }
      }

      // 2) If using a new card (no selectedCardId), create a payment card record (and billing address) - saved or not
      let usedCardID = null;
      if (selectedCardId) {
        usedCardID = Number(selectedCardId);
      } else {
        if (!card || !card.cardNo || !card.expirationDate || !card.nameOnCard || !card.billingAddress) {
          throw new Error("Invalid card data");
        }
        // Accept zip in either 'zipCode' or 'zip' property
        if (!card.billingAddress.zipCode && !card.billingAddress.zip) {
          throw new Error("Invalid billing address: zip code missing");
        }

        // Create billing address
        const billing = await tx.address.create({ data: {
          street: card.billingAddress.street,
          city: card.billingAddress.city,
          state: card.billingAddress.state,
          zipCode: card.billingAddress.zipCode || card.billingAddress.zip,
          addressTypeId: 2, // billing
          userID: Number(userID),
          createdAt: new Date(),
          updatedAt: new Date()
        } });

        // Hash the card number; store masked last4
        const last4 = (card.cardNo || '').slice(-4);
        const hashed = await hashPassword(card.cardNo);
        const createdCard = await tx.paymentCard.create({ data: {
          cardNo: hashed,
          maskedCardNo: last4,
          expirationDate: card.expirationDate,
          userID: Number(userID),
          billingAddressId: billing.id,
          createdAt: new Date(),
          updatedAt: new Date()
        } });

        usedCardID = createdCard.id;
        // Optionally, if not saving the card to user's account, we still create a card record linked to the user
        // If saveCard is false, you could or could not persist it; for now we persist always (for referential consistency)
      }

      // 3) Create booking row and update show seats
      // Determine movieShow (to fetch auditoriumID & validate seats)
      const movieShow = await tx.movieShow.findUnique({ where: { id: Number(showTimeID) } });
      if (!movieShow) throw new Error("Show not found");

      // Map seat labels to seat IDs
      const seatIds = [];
      for (const label of seats) {
        const row = label.replace(/\d+$/, "");
        const col = parseInt(label.replace(/^\D+/, ""), 10);
        const seatRec = await tx.seat.findFirst({ where: { auditoriumID: movieShow.auditoriumID, rowNum: row, colNum: col } });
        if (!seatRec) {
          throw new Error(`Seat not found: ${label}`);
        }
        seatIds.push(seatRec.id);
      }

      // Validate seats are available or temp
      for (const sid of seatIds) {
        const ss = await tx.showSeats.findFirst({ where: { seatID: sid, showID: movieShow.id } });
        if (!ss || ss.status !== 'temp') {
          throw new Error(`Seat ${sid} not held for booking.`);
        }
      }

      // Create booking
      const bookingRow = await tx.booking.create({ data: {
        noOfTickets: Number(noOfTickets),
        userID: Number(userID),
        showTimeID: Number(showTimeID),
        cardID: Number(usedCardID),
        promoID: Number(usedPromoID),
      } });

      // Update showSeats status to 'booked'
      for (const sid of seatIds) {
        await tx.showSeats.updateMany({ where: { seatID: sid, showID: movieShow.id }, data: { status: 'booked' } });
        // Optionally, create Ticket rows; for now, we create a simple ticket with adult category
        const adultCategory = await tx.ticketCategory.findFirst({ where: { name: 'Adult' } });
        const categoryId = adultCategory ? adultCategory.id : undefined;
        await tx.ticket.create({ data: { categoryID: categoryId || 1, bookingID: bookingRow.id, seatID: sid } });
      }

      return bookingRow;
    }); // end transaction

    return res.status(201).json(result);
  } catch (err) {
    console.error("createBooking error:", err.stack || err);
    if (err.message && err.message.startsWith("Invalid")) {
      return res.status(400).json({ error: err.message });
    }
    if (err.message && err.message.startsWith("Seat ") && err.message.includes("not held")) {
      return res.status(409).json({ error: err.message });
    }
    // For troubleshooting, include the message in response so frontend shows it (remove in prod)
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
}

export async function fetchCards(req, res) {
  try {
    const { userID } = req.body || {};
    if (!userID || !Number.isInteger(Number(userID))) return res.status(400).json({ error: "Invalid userID" });

    const cards = await prisma.paymentCard.findMany({ where: { userID: Number(userID) }, include: { billingAddress: true } });
    // Mask card numbers
    const out = cards.map(c => ({ id: c.id, cardNo: `•••• ${c.maskedCardNo}`, expirationDate: c.expirationDate, billingAddress: c.billingAddress }));
    return res.json(out);
  } catch (err) {
    console.error("fetchCards error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
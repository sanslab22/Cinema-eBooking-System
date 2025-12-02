import prisma from "../prismaClient.js";

// GET /api/orders/user/:userID
export async function getUserOrders(req, res) {
  try {
    const userID = Number(req.params.userID);

    if (!userID || isNaN(userID)) {
      return res.status(400).json({ error: "Invalid User ID" });
    }

    const bookings = await prisma.booking.findMany({
      where: { userID: userID },
      orderBy: { id: 'desc' }, 
      include: {
        movieShow: {
          include: {
            movie: true, 
          }
        },
        tickets: {
          include: {
            seat: true,
            category: true // Fetches price for Adult, Child, etc.
          }
        },
        paymentCard: true,
        promotion: true // <--- We need this to calculate the discount
      }
    });

    const formattedOrders = bookings.map(b => {
      // 1. Calculate Subtotal (Sum of all tickets)
      const subtotal = b.tickets.reduce((sum, t) => {
        return sum + (t.category?.price || 0);
      }, 0);

      // 2. Calculate Discount
      let discountAmount = 0;
      // Check if a valid promo exists and isn't the default "NO_PROMOTION"
      if (b.promotion && b.promotion.promoCode !== 'NO_PROMOTION') {
         const promoVal = parseFloat(b.promotion.promoValue);
         if (!isNaN(promoVal)) {
            // ASSUMPTION: promoValue is stored as a percentage (e.g., "25" for 25%)
            // If your DB stores flat amounts (e.g., "5.00"), change this logic.
            discountAmount = subtotal * (promoVal / 100);
         }
      }

      // 3. Final Total
      const finalTotal = subtotal - discountAmount;
      
      // Format Seats
      const seatLabels = b.tickets.map(t => {
        if(!t.seat) return "N/A";
        return `${t.seat.rowNum}${t.seat.colNum}`; 
      });

      return {
        id: b.id,
        bookingDate: b.createdAt,
        movieTitle: b.movieShow?.movie?.movieTitle || "Unknown Movie",
        showDate: b.movieShow?.showStartTime,
        showTime: b.movieShow?.showStartTime,
        seats: seatLabels,
        
        // Return the calculated final price
        totalPrice: finalTotal > 0 ? finalTotal : 0,
        
        cardLast4: b.paymentCard?.maskedCardNo || "XXXX",
        status: "Confirmed" 
      };
    });

    return res.json({ success: true, data: formattedOrders });

  } catch (err) {
    console.error("getUserOrders error:", err);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
}
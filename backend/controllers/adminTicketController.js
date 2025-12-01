import prisma from "../prismaClient.js";

// GET /api/admin/tickets
export async function listTickets(req, res) {
  try {
    // 1. Use the correct model name: ticketCategory
    const tickets = await prisma.ticketCategory.findMany({
      orderBy: { id: 'asc' },
    });

    // 2. Map 'name' to 'category' so the Frontend displays it correctly
    const formattedTickets = tickets.map(t => ({
      id: t.id,
      category: t.name, // Schema has 'name', Frontend expects 'category'
      price: t.price
    }));
    
    return res.json(formattedTickets);
  } catch (err) {
    console.error("listTickets error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

// PUT /api/admin/tickets/:id
export async function updateTicketPrice(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const { price } = req.body || {};
    const numericPrice = Number(price);

    if (price === undefined || isNaN(numericPrice)) {
      return res.status(400).json({ error: "Price must be a number." });
    }

    // WARNING: Your schema defines price as 'Int'. 
    // Prisma will error if you try to save 10.50 into an Int field.
    // If you need cents (10.50), you must change your Schema to 'Float' or 'Decimal'.
    // For now, this code rounds it to an Integer to prevent crashing.
    const safePrice = Math.round(numericPrice); 

    // 3. Use ticketCategory
    const updatedTicket = await prisma.ticketCategory.update({
      where: { id },
      data: {
        price: safePrice, 
      },
    });

    // Return it formatted for the frontend
    return res.status(200).json({
      id: updatedTicket.id,
      category: updatedTicket.name,
      price: updatedTicket.price
    });

  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Ticket category not found" });
    }
    console.error("updateTicketPrice error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
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

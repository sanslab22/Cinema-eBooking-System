// controllers/adminPromotionController.js
import prisma from "../prismaClient.js";

function isDateLike(s) {
  if (typeof s !== "string") return false;
  const d = new Date(s);
  return !Number.isNaN(d.getTime());
}

// POST /api/admin/promotions
// Body: { promoCode, promoValue, startDate, expirationDate }
export async function createPromotion(req, res) {
  try {
    const { promoCode, promoValue, startDate, expirationDate } = req.body || {};

    const errors = [];
    if (!promoCode || typeof promoCode !== "string") errors.push("promoCode is required (string).");
    if (!promoValue || typeof promoValue !== "string") errors.push("promoValue is required (string).");
    if (!isDateLike(startDate)) errors.push("startDate must be a valid date (YYYY-MM-DD or ISO).");
    if (!isDateLike(expirationDate)) errors.push("expirationDate must be a valid date (YYYY-MM-DD or ISO).");
    if (!errors.length) {
      const sd = new Date(startDate);
      const ed = new Date(expirationDate);
      if (sd > ed) errors.push("startDate must be on or before expirationDate.");
    }
    if (errors.length) return res.status(400).json({ errors });

    // Create (dates are stored as date-only due to @db.Date)
    const promo = await prisma.promotions.create({
      data: {
        promoCode: promoCode.trim(),
        promoValue: promoValue.trim(),
        startDate: new Date(startDate),
        expirationDate: new Date(expirationDate),
      },
    });

    return res.status(201).json(promo);
  } catch (err) {
    console.error("createPromotion error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

// GET /api/admin/promotions
export async function listPromotions(_req, res) {
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

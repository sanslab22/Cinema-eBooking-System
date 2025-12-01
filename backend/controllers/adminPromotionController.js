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

    // Check for an existing, active promotion with the same promoCode.
    // An active promotion is one where the expiration date is in the future or today.
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to the start of the day

    const existingActivePromo = await prisma.promotions.findFirst({
      where: {
        promoCode: {
          equals: promoCode.trim(),
          mode: 'insensitive', // Case-insensitive check
        },
        expirationDate: {
          gte: today, // gte: greater than or equal to
        },
      },
    });

    if (existingActivePromo) {
      return res.status(409).json({ error: "An active promotion with this code already exists." });
    }

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

// DELETE /api/admin/promotions/:id
export async function deletePromotion(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    await prisma.promotions.delete({
      where: { id },
    });

    return res.status(200).json({ message: "Promotion deleted successfully" });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Promotion not found" });
    }
    console.error("deletePromotion error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

// PUT /api/admin/promotions/:id
export async function updatePromotion(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const { promoCode, promoValue, startDate, expirationDate } = req.body || {};

    // Validation (reuse existing validation logic)
    const errors = [];
    if (!promoCode || typeof promoCode !== "string") errors.push("promoCode is required.");
    if (!promoValue || typeof promoValue !== "string") errors.push("promoValue is required.");
    if (!isDateLike(startDate)) errors.push("startDate must be a valid date.");
    if (!isDateLike(expirationDate)) errors.push("expirationDate must be a valid date.");
    
    // Date Logic Validation
    if (!errors.length) {
      const sd = new Date(startDate);
      const ed = new Date(expirationDate);
      if (sd > ed) errors.push("startDate must be on or before expirationDate.");
    }

    if (errors.length) return res.status(400).json({ errors });

    // Update the promotion
    const updatedPromo = await prisma.promotions.update({
      where: { id },
      data: {
        promoCode: promoCode.trim(),
        promoValue: promoValue.trim(),
        startDate: new Date(startDate),
        expirationDate: new Date(expirationDate),
      },
    });

    return res.status(200).json(updatedPromo);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Promotion not found" });
    }
    console.error("updatePromotion error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
import express from "express";
import cors from "cors";
import prisma from "../prismaClient.js";
import { hashPassword } from "../utils/hashUtils.js";


// PLEASE ONLY DEFINE THE ENDPOINTS HERE, LOGIC HANDLED IN CONTROLLER/UTILS

const router = express.Router();

router.use(express.json());
router.use(cors());

/* ----------------------------- helpers ----------------------------- */

// remove secrets + mask PANs while keeping “everything else”
function sanitizeFullUser(raw) {
  if (!raw) return raw;

  const user = JSON.parse(JSON.stringify(raw));
  delete user.passwordHash;
  delete user.refreshTokenId;

  if (Array.isArray(user.paymentCards)) {
    user.paymentCards = user.paymentCards.map((c) => {
      const last4 = (c.cardNo || "").slice(-4);
      return { ...c, cardNo: last4 ? `•••• ${last4}` : null };
    });
  }
  return user;
}

/** Replace the single home address (addressTypeId: 1) if provided */
async function replaceHomeAddressIfProvided(tx, userId, homeAddress) {
  if (!homeAddress) return;

  await tx.address.deleteMany({ where: { userID: userId, addressTypeId: 1 } });
  await tx.address.create({
    data: {
      street: homeAddress.street,
      city: homeAddress.city,
      state: homeAddress.state,
      zipCode: homeAddress.zipCode,
      addressTypeId: 1, 
      userID: userId,
    },
  });
}

/** Replace all payment cards (max 3) if array provided, including their billing addresses */
async function replaceCardsIfProvided(tx, userId, paymentCards) {
  if (!Array.isArray(paymentCards)) return;
  if (paymentCards.length > 3) throw new Error("You can store at most 3 payment cards.");

  const existing = await tx.paymentCard.findMany({ where: { userID: userId } });
  if (existing.length) {
    const billingIds = existing.map((c) => c.billingAddressId).filter(Boolean);
    await tx.paymentCard.deleteMany({ where: { userID: userId } });
    if (billingIds.length) {
      await tx.address.deleteMany({ where: { id: { in: billingIds } } });
    }
  }

  for (const card of paymentCards) {
    const billingAddress = await tx.address.create({
      data: {
        street: card?.billingAddress?.street,
        city: card?.billingAddress?.city,
        state: card?.billingAddress?.state,
        zipCode: card?.billingAddress?.zipCode,
        addressTypeId: 2, 
        userID: userId,
      },
    });

    await tx.paymentCard.create({
      data: {
        cardNo: card.cardNo,
        expirationDate: card.expirationDate, 
        userID: userId,
        billingAddressId: billingAddress.id,
      },
    });
  }
}

/* ------------------------------- GET -------------------------------- */

/** GET /api/users/:id — return the full user (all relations) minus secrets */
router.get("/users/:id", async (req, res) => {
  console.log("GET /users/:id →", req.params.id);
  try {
    const userId = Number(req.params.id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    const raw = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userType: true,
        userStatus: true,
        addresses: true,
        paymentCards: { include: { billingAddress: true } },
      },
    });

    if (!raw) return res.status(404).json({ error: "Not found" });

    return res.json(sanitizeFullUser(raw));
  } catch (err) {
    console.error("GET /users/:id error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/* ------------------------------ PATCH ------------------------------- */

/**
 * PATCH /api/users/:id
 * Allowed: firstName, lastName, password, phoneNumber, EnrollforPromotions, homeAddress, paymentCards
 * Forbidden: email, userTypeId
 * Returns full user (sanitized).
 */
router.patch("/users/:id", async (req, res) => {
  console.log("PATCH /users/:id →", req.params.id);
  console.log("Full request body (update):", req.body);
  try {
    const userId = Number(req.params.id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    
    const forbidden = [];
    if ("email" in req.body) forbidden.push("email");
    if ("userTypeId" in req.body) forbidden.push("userTypeId");
    if (forbidden.length) {
      return res
        .status(403)
        .json({ error: `Not allowed to change: ${forbidden.join(", ")}` });
    }

    const {
      firstName,
      lastName,
      password,                
      phoneNumber,             
      EnrollforPromotions,     
      homeAddress,             
      paymentCards,           
    } = req.body;

    const raw = await prisma.$transaction(async (tx) => {
      // 1) Update scalar fields (allowed only)
      const data = {};
      if (firstName !== undefined)           data.firstName = firstName;
      if (lastName  !== undefined)           data.lastName = lastName;
      if (phoneNumber !== undefined)         data.phoneNumber = phoneNumber;
      if (EnrollforPromotions !== undefined) data.EnrollforPromotions = !!EnrollforPromotions;
      if (password)                          data.passwordHash = await hashPassword(password);

      if (Object.keys(data).length > 0) {
        await tx.user.update({ where: { id: userId }, data });
      } else {
        // ensure the user exists; throws if not found
        await tx.user.findUniqueOrThrow({ where: { id: userId } });
      }

      // 2) Replace relations if provided
      await replaceHomeAddressIfProvided(tx, userId, homeAddress);
      await replaceCardsIfProvided(tx, userId, paymentCards);

      // 3) Return full user (then sanitize)
      return tx.user.findUnique({
        where: { id: userId },
        include: {
          userType: true,
          userStatus: true,
          addresses: true,
          paymentCards: { include: { billingAddress: true } },
        },
      });
    });

    return res.status(200).json(sanitizeFullUser(raw));
  } catch (err) {
    console.error("PATCH /users/:id error:", err);
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Not found" });
    }
    if (String(err.message || "").includes("at most 3 payment cards")) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/* ------------------------ global error handler ----------------------- */

router.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

export default router;
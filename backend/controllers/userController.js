// just write the logic portion here, e.g. export const editHomeAddress = ...// controllers/userController.js
import prisma from "../prismaClient.js";
import { hashPassword } from "../utils/hashUtils.js";
import {
  sanitizeFullUser,
  replaceHomeAddressIfProvided,
  replaceCardsIfProvided,
} from "../utils/userUtils.js";

/** GET /api/users/:id — return full user (same include as register), sanitized */
export async function getUserById(req, res) {
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
}

/** PATCH /api/users/:id — update allowed fields; forbid email & userTypeId; return sanitized full user */
export async function updateUserById(req, res) {
  console.log("PATCH /users/:id →", req.params.id);
  console.log("Full request body (update):", req.body);
  try {
    const userId = Number(req.params.id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    // Block forbidden fields up front
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
      password,                // optional → hash if present
      phoneNumber,             // optional
      EnrollforPromotions,     // optional (boolean)
      homeAddress,             // optional → replace addressTypeId:1
      paymentCards,            // optional → replace all (max 3)
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
        // Ensure user exists; throws if not found
        await tx.user.findUniqueOrThrow({ where: { id: userId } });
      }

      // 2) Replace relations if provided
      await replaceHomeAddressIfProvided(tx, userId, homeAddress);
      await replaceCardsIfProvided(tx, userId, paymentCards);

      // 3) Return full user (same include as register)
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
}

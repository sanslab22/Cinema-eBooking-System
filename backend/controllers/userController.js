// just write the logic portion here, e.g. export const editHomeAddress = ...// controllers/userController.js
import prisma from "../prismaClient.js";
import { hashPassword, comparePasswords } from "../utils/hashUtils.js";
import {
  sanitizeFullUser,
  replaceHomeAddressIfProvided,
  replaceCardsIfProvided,
} from "../utils/userUtils.js";

/** GET /api/users - return all users  */
export async function getUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      include: {
        userType: true,
        userStatus: true,
      },
    });

    res.json({
      total: users.length,
      items: users,
    });
  } catch (err) {
    console.error("GET /users error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

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
      oldPassword,                // optional → hash if present
      newPassword,                // optional → hash if present
      phoneNumber,             // optional
      EnrollforPromotions,     // optional (boolean)
      homeAddress,             // optional → replace addressTypeId:1
      paymentCards,            // optional → replace all (max 3)
      userStatusId            
    } = req.body;

    const raw = await prisma.$transaction(async (tx) => {
      // 1) Update scalar fields (allowed only)
      const data = {};
      if (firstName !== undefined)           data.firstName = firstName;
      if (lastName  !== undefined)           data.lastName = lastName;
      if (phoneNumber !== undefined)         data.phoneNumber = phoneNumber;
      if (EnrollforPromotions !== undefined) data.EnrollforPromotions = !!EnrollforPromotions;
      
      // Handle password change if both oldPassword & newPassword are provided
      // --- 2. Use 'comparePasswords' (plural) ---
      if (oldPassword && newPassword) {
        // a. Fetch the current user to verify their old password
        const currentUser = await tx.user.findUniqueOrThrow({ where: { id: userId } });
        const isMatch = await comparePasswords(oldPassword, currentUser.passwordHash);

        if (!isMatch) {
          // b. If no match, throw a specific error
          throw new Error("Incorrect old password");
        }
        
        // c. If match, hash the new password
        data.passwordHash = await hashPassword(newPassword);
      }

      if (userStatusId !== undefined) data.userStatusId = userStatusId;

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
    if (err.message === "Incorrect old password") {
      // This will be caught by your frontend's catch block
      return res.status(400).json({ message: "Incorrect old password." });
    }
    
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Not found" });
    }
    if (String(err.message || "").includes("at most 3 payment cards")) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function promoteUser(req, res) {
  try {
    const userId = Number(req.params.id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { userTypeId: 1 },
      select: { id: true, firstName: true, lastName: true, userTypeId: true },
    });

    return res.status(200).json(updated);
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ error: "Not found" });
    console.error("PATCH /admin/users/:id/promote error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function deleteUserById(req, res) {
  try {
    const userId = Number(req.params.id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    const result = await prisma.$transaction(async (tx) => {
      // bookings → tickets first
      const bookings = await tx.booking.findMany({
        where: { userID: userId },
        select: { id: true },
      });
      const bookingIds = bookings.map(b => b.id);

      if (bookingIds.length) {
        await tx.ticket.deleteMany({ where: { bookingID: { in: bookingIds } } });
        await tx.booking.deleteMany({ where: { id: { in: bookingIds } } });
      }

      // payment cards (bookings removed, so FK clear)
      await tx.paymentCard.deleteMany({ where: { userID: userId } });

      // addresses
      await tx.address.deleteMany({ where: { userID: userId } });

      // finally the user
      return tx.user.delete({
        where: { id: userId },
        select: { id: true, firstName: true, lastName: true, email: true },
      });
    });

    return res.status(200).json({ message: "User deleted", deleted: result });
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ error: "Not found" });
    console.error("DELETE /admin/users/:id error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}



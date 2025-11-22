// controllers/adminUserController.js
import prisma from "../prismaClient.js";

/**
 * GET /api/admin/subscribed-emails
 * Retrieves the email addresses of all users subscribed to promotions.
 * This is an admin-only protected route.
 */
export async function getSubscribedUserEmails(req, res) {
  try {
    const users = await prisma.user.findMany({
      where: { EnrollforPromotions: true },
      select: { email: true }, // Only select the email field
    });

    const emails = users.map(user => user.email);
    return res.status(200).json(emails);
  } catch (err) {
    console.error("getSubscribedUserEmails error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
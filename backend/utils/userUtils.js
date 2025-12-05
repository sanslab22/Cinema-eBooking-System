import { hashPassword } from "../utils/hashUtils.js";

/** remove secrets + mask PANs while keeping everything else */
export function sanitizeFullUser(raw) {
  if (!raw) return raw;

  // deep clone so we don't mutate Prisma result
  const user = JSON.parse(JSON.stringify(raw));

  // drop secrets
  delete user.passwordHash;
  delete user.refreshTokenId;

  // mask card numbers
  user.paymentCards = user.paymentCards.map((c) => {
    const last4 = c.maskedCardNo || null;
    return { ...c, cardNo: last4 ? `•••• ${last4}` : null };
  });


  return user;
}

/** Replace the single home address (addressTypeId: 1) if provided */
// if the home address does not exist, create one

export async function replaceHomeAddressIfProvided(tx, userId, homeAddress) {
  if (!homeAddress) return;

  // Look for an existing home address for the user
  const existingHome = await tx.address.findFirst({
    where: {
      userID: userId,
      addressTypeId: 1
    }
  });

  if (existingHome) {
    // Update the found home address
    await tx.address.update({
      where: { id: existingHome.id },
      data: {
        street: homeAddress.street,
        city: homeAddress.city,
        state: homeAddress.state,
        zipCode: homeAddress.zipCode,
        updatedAt: new Date()
      }
    });
  } else {
    // Create a new home address
    await tx.address.create({
      data: {
        street: homeAddress.street,
        city: homeAddress.city,
        state: homeAddress.state,
        zipCode: homeAddress.zipCode,
        addressTypeId: 1, // Home
        userID: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }
}

/** Replace all payment cards (max 3) if array provided, including their billing addresses */
// 
/**
 * Syncs payment cards:
 * 1. Removes cards not present in the new list.
 * 2. Updates existing cards (only updating cardNo if provided).
 * 3. Creates new cards.
 */
export async function replaceCardsIfProvided(tx, userId, cards) {
  if (!cards) return;

  // if (cards.length > 3) {
  //   throw new Error("User can have at most 3 payment cards");
  // }

  // 1. Identify existing cards to handle deletions
  const existingCards = await tx.paymentCard.findMany({
    where: { userID: userId },
  });
  
  const existingIds = existingCards.map((c) => c.id);
  // Filter incoming cards that have an ID (updates) vs no ID (creates)
  const incomingIds = cards.filter((c) => c.id).map((c) => c.id);

  // Determine which IDs to delete (in DB but not in payload)
  const toDelete = existingIds.filter((id) => !incomingIds.includes(id));

  if (toDelete.length > 0) {
    // Capture associated billing addresses before deleting cards
    const addressIdsToDelete = existingCards
      .filter(c => toDelete.includes(c.id) && c.billingAddressId)
      .map(c => c.billingAddressId);

    // Delete the cards first (because they hold the foreign key to the address)
    await tx.paymentCard.deleteMany({
      where: { id: { in: toDelete } },
    });

    // Delete the orphaned addresses
    if (addressIdsToDelete.length > 0) {
      await tx.address.deleteMany({
        where: { id: { in: addressIdsToDelete } },
      });
    }
  }

  // 2. Process Upserts (Create or Update)
  for (const card of cards) {
    // Prepare Billing Address Data
    const billingData = card.billingAddress || { street: "", city: "", state: "", zipCode: "" };

    if (card.id) {
      // --- UPDATE EXISTING CARD ---
      const updateData = {
        expirationDate: card.expirationDate,
      };

      // Only update card number logic if a NEW cardNo is provided.
      // The frontend now sends undefined/null for cardNo if it wasn't changed.
      if (card.cardNo && !card.cardNo.startsWith("••••")) {
        updateData.cardNo = await hashPassword(card.cardNo);
        updateData.maskedCardNo = card.cardNo.slice(-4);
      }

      await tx.paymentCard.update({
        where: { id: card.id },
        data: {
          ...updateData,
          billingAddress: {
            update: {
              street: billingData.street,
              city: billingData.city,
              state: billingData.state,
              zipCode: billingData.zipCode,
              // Keep type as 2 if updating, though it should already be 2
            },
          },
        },
      });
    } else {
      // --- CREATE NEW CARD ---
      if (!card.cardNo) {
        throw new Error("New payment card is missing a card number.");
      }

      const hashed = await hashPassword(card.cardNo);
      const masked = card.cardNo.slice(-4);

      await tx.paymentCard.create({
        data: {
          user: {
            connect: { id: userId }
          },
          cardNo: hashed,
          maskedCardNo: masked,
          expirationDate: card.expirationDate,
          billingAddress: {
            create: {
              addressType: { connect: { id: 2 } }, // 2 = Billing Address
              street: billingData.street,
              city: billingData.city,
              state: billingData.state,
              zipCode: billingData.zipCode,
              user: {
                connect: { id: userId }
              }
            },
          },
        },
      });
    }
  }
}
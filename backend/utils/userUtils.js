// utils/userUtils.js

/** remove secrets + mask PANs while keeping everything else */
export function sanitizeFullUser(raw) {
  if (!raw) return raw;

  // deep clone so we don't mutate Prisma result
  const user = JSON.parse(JSON.stringify(raw));

  // drop secrets
  delete user.passwordHash;
  delete user.refreshTokenId;

  // mask card numbers
  if (Array.isArray(user.paymentCards)) {
    user.paymentCards = user.paymentCards.map((c) => {
      const last4 = (c.cardNo || "").slice(-4);
      return { ...c, cardNo: last4 ? `•••• ${last4}` : null };
    });
  }

  return user;
}

/** Replace the single home address (addressTypeId: 1) if provided */
export async function replaceHomeAddressIfProvided(tx, userId, homeAddress) {
  if (!homeAddress) return;

  await tx.address.deleteMany({ where: { userID: userId, addressTypeId: 1 } });
  await tx.address.create({
    data: {
      street: homeAddress.street,
      city: homeAddress.city,
      state: homeAddress.state,
      zipCode: homeAddress.zipCode,
      addressTypeId: 1, // Home
      userID: userId,
    },
  });
}

/** Replace all payment cards (max 3) if array provided, including their billing addresses */
export async function replaceCardsIfProvided(tx, userId, paymentCards) {
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
        addressTypeId: 2, // Billing
        userID: userId,
      },
    });

    await tx.paymentCard.create({
      data: {
        cardNo: card.cardNo,
        expirationDate: card.expirationDate, // MM/YY (per your schema)
        userID: userId,
        billingAddressId: billingAddress.id,
      },
    });
  }
}

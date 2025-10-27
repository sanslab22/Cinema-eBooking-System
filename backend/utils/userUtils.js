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
export async function replaceCardsIfProvided(tx, userId, paymentCards) {
  if (!paymentCards) return;

  if (paymentCards.length > 3) {
    throw new Error("You can have at most 3 payment cards");
  }

  // Delete all the user's current payment cards (will also orphan addresses, which is fine if not shared)
  await tx.paymentCard.deleteMany({
    where: { userID: userId }
  });

  for (const card of paymentCards) {
    const { billingAddress, ...cardData } = card;

    // Create the billing address first, if present
    let billingAddressId = null;
    if (billingAddress) {
      const createdBillingAddress = await tx.address.create({
        data: {
          street: billingAddress.street,
          city: billingAddress.city,
          state: billingAddress.state,
          zipCode: billingAddress.zipCode,
          addressTypeId: 2, // Billing
          userID: userId,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      billingAddressId = createdBillingAddress.id;
    } else {
      throw new Error("A billing address must be provided for each payment card");
    }

    // Now create the payment card with reference to the new billing address
    await tx.paymentCard.create({
      data: {
        cardNo: cardData.cardNo,
        expirationDate: cardData.expirationDate,
        userID: userId,
        billingAddressId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }
}
import jwt from "jsonwebtoken";
import { hashPassword, comparePasswords } from "../utils/hashUtils.js";
import { createUser, findUserByEmail } from "../models/userModel.js";
import prisma from "../prismaClient.js";


const JWT_SECRET = process.env.JWT_SECRET;


export const register = async (req, res) => {
  console.log("Full request body:", req.body);
  try {
    const {
      email, firstName, lastName, password,
      homeAddress, paymentCards
    } = req.body;

    const existing = await findUserByEmail(email);
    if (existing) return res.status(400).json({ message: "User already exists." });

    const hashed = await hashPassword(password);

    // Atomic multi-table creation
    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email,
          firstName,
          lastName,
          passwordHash: hashed,
          userTypeId: 2,
          userStatusId: 1,
        },
      });

      if (homeAddress) {
        await tx.address.create({
          data: {
            street: homeAddress.street,
            city: homeAddress.city,
            state: homeAddress.state,
            zipCode: homeAddress.zipCode,
            addressTypeId: 1,
            userID: createdUser.id,
          },
        });
      }

      if (paymentCards && Array.isArray(paymentCards) && paymentCards.length > 0 && paymentCards.length <= 3) {
        for (const card of paymentCards) {
          const billingAddress = await tx.address.create({
            data: {
              street: card.billingAddress.street,
              city: card.billingAddress.city,
              state: card.billingAddress.state,
              zipCode: card.billingAddress.zipCode,
              addressTypeId: 2,
              userID: createdUser.id,
            },
          });

          await tx.paymentCard.create({
            data: {
              cardNo: card.cardNo,
              expirationDate: card.expirationDate,
              userID: createdUser.id,
              billingAddressId: billingAddress.id,
            },
          });
        }
      }

      return tx.user.findUnique({
        where: { id: createdUser.id },
        include: {
          userType: true,
          userStatus: true,
          addresses: true,
          paymentCards: {
            include: { billingAddress: true },
          },
        },
      });
    });

    res.status(201).json({ message: "User registered successfully.", user });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: err.message });
  }
};



// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await findUserByEmail(email);
//     if (!user) return res.status(404).json({ message: "User not found." });

//     const valid = await comparePasswords(password, user.passwordHash);
//     if (!valid) return res.status(401).json({ message: "Invalid credentials." });

//     const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
//       expiresIn: "1d",
//     });

//     res.json({ message: "Login successful", token, user });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        addresses: true, // all addresses (home, billing)
        paymentCards: {
          include: { billingAddress: true },
        },
        userType: true,
        userStatus: true,
      },
    });

    if (!user) return res.status(404).json({ message: "User not found." });

    const valid = await comparePasswords(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: "Invalid credentials." });

    // Find home address (addressTypeId == 1)
    const homeAddress = user.addresses.find(addr => addr.addressTypeId === 1);

    const paymentCards = user.paymentCards.map(card => ({
      cardNumber: `**** **** **** ${card.cardNo.slice(-4)}`,
      name: `${user.firstName} ${user.lastName}`,
      expiry: card.expirationDate,
      zip: card.billingAddress.zipCode,
      billingAddress: {
        street: card.billingAddress.street,
        city: card.billingAddress.city,
        state: card.billingAddress.state,
        zip: card.billingAddress.zipCode,
      },
    }));

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        homeAddress: homeAddress ? {
          street: homeAddress.street,
          city: homeAddress.city,
          state: homeAddress.state,
          zip: homeAddress.zipCode,
        } : null,
        password: "********",
        paymentCards,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

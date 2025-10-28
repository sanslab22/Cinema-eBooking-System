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
          userStatusId: 2,
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

          // 1. Get the string from the request (e.g., "12/25")
          const [month, year] = card.expirationDate.split('/');

          // 2. Create a Date object representing the last day of that month
          const validExpDate = new Date(`20${year}-${month}-01`); // Day 0 gives last day of previous month

          const hashedCardNo = await hashPassword(card.cardNo);

          await tx.paymentCard.create({
            data: {
              cardNo: hashedCardNo,
              expirationDate: validExpDate,
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

    // Set userStatusId to Active (1) upon successful login
    await prisma.user.update({
      where: { id: user.id },
      data: { userStatusId: 1 },
    });
    
    // --- 1. THIS IS THE LINE YOU NEED TO ADD ---
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "1d",
    });

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
      token: token, // --- 2. RETURN THE TOKEN ---
      user: {
        id: user.id,
        userTypeId: user.userType.id,
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

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ error: "Email and new password are required." });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { email },
      data: { passwordHash },
    });
    res.json({ message: "Password reset successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const checkEmailExists = async (req, res) => {
  try {
    const { email } = req.body;
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
    res.json({ exists: !!user });
  } catch (err) {
    console.error("checkEmailExists error:", err); // Log the actual error for server-side debugging
    res.status(500).json({ error: "Internal Server Error", details: err.message }); // Provide more details in the response
  }

};

export const logoutUserStatusUpdate = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "User ID is required" });

    // Update userStatusId to 2 (Inactive)
    await prisma.user.update({
      where: { id: parseInt(userId, 10) },
      data: { userStatusId: 2 },
    });

    res.json({ message: "User status set to Inactive on logout." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

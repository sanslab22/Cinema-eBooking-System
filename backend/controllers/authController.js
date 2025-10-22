import jwt from "jsonwebtoken";
import { hashPassword, comparePasswords } from "../utils/hashUtils.js";
import { createUser, findUserByEmail } from "../models/userModel.js";

const JWT_SECRET = process.env.JWT_SECRET || "cinema-secret-key";

export const register = async (req, res) => {
//   console.log("Register endpoint hit with body:", req.body);

  try {
    const { email, firstName, lastName, password } = req.body;

    const existing = await findUserByEmail(email);
    if (existing) return res.status(400).json({ message: "User already exists." });

    const hashed = await hashPassword(password);

    const user = await createUser({
      email,
      firstName,
      lastName,
      passwordHash: hashed,
      userType: {
        connect: { id: 2 } // Customer
      },
      userStatus: {
        connect: { id: 1 } // Inactive because they will now be redirected to login
      }
    });

    res.status(201).json({ message: "User registered successfully.", user });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: err.message });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ message: "User not found." });

    const valid = await comparePasswords(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: "Invalid credentials." });

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ message: "Login successful", token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// routes/userRoutes.js
import express from "express";
import cors from "cors";
import { getUsers, getUserById, updateUserById } from "../controllers/userController.js";

// PLEASE ONLY DEFINE THE ENDPOINTS HERE, LOGIC HANDLED IN CONTROLLER/UTILS
const router = express.Router();

router.use(express.json());
router.use(cors());

// GET /api/users - retrieve all users
router.get("/users", getUsers);

// GET /api/users/:id — full user (relations) minus secrets
router.get("/users/:id", getUserById);

// PATCH /api/users/:id — update allowed fields, forbid email & userTypeId
router.patch("/users/:id", updateUserById);

// Global error handler (kept like your movie routes style)
router.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

export default router;

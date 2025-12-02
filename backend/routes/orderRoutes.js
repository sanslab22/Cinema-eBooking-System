import express from "express";
import { getUserOrders } from "../controllers/orderController.js";

const router = express.Router();

// Route: /api/orders/user/:userID
router.get("/user/:userID", getUserOrders);

export default router;
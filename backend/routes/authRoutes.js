import express from "express";
import { register, login, resetPassword, checkEmailExists, logoutUserStatusUpdate, verifyUser} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logoutUserStatusUpdate);
router.post("/reset-password", resetPassword);
router.post("/check-email-exists", checkEmailExists);
router.post("/verify", verifyUser)

export default router;

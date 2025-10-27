import express from "express";
import { register, login, resetPassword, checkEmailExists} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/reset-password", resetPassword);
router.post("/check-email-exists", checkEmailExists);


export default router;

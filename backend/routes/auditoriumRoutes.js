import express from "express";
import cors from "cors";
import { listAuditoriums, getAuditoriumById } from "../controllers/auditoriumController.js";

const router = express.Router();
router.use(express.json());
router.use(cors());

router.get("/auditoriums", listAuditoriums);
router.get("/auditoriums/:auditoriumId", getAuditoriumById);

export default router;
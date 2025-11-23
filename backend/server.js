import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import movieRoutes from "./routes/movieRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import auditoriumRoutes from "./routes/auditoriumRoutes.js";



dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api", movieRoutes);
app.use("/api", userRoutes);
app.use("/api", adminRoutes);  
app.use("/api", auditoriumRoutes);  


app.get("/", (req, res) => res.send("Cinema E-Booking API running..."));

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initializeDatabase } from "./db/index.js";
import inventoryRoutes from "./routes/inventory.js";
import actionRoutes from "./routes/actions.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/inventory", inventoryRoutes);
app.use("/actions", actionRoutes);

// Initialize database on startup
await initializeDatabase();

app.listen(process.env.PORT, () =>
  console.log(`Backend running on port ${process.env.PORT}`)
);

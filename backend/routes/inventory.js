import express from "express";
import { 
  getInventory, 
  addTruck, 
  addCustom, 
  sell 
} from "../controllers/inventoryController.js";

const router = express.Router();

router.get("/", getInventory);
router.post("/add-truck", addTruck);
router.post("/add-custom", addCustom);
router.post("/sell", sell);

export default router;

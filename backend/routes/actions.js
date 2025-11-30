import express from "express";
import { pool } from "../db.js";

const router = express.Router();

/*
  BODY FORMAT FROM FRONTEND:
  {
    "action": "fullTruck" | "splitTruck" | "custom" | "sell",
    "locationId": 1,
    "qty4x5": 20,
    "qty4x8": 10
  }
*/

router.post("/", async (req, res) => {
  try {
    const { action, locationId, qty4x5 = 0, qty4x8 = 0 } = req.body;

    // Inventory updates depend on action type
    let add4x5 = 0;
    let add4x8 = 0;

    if (action === "fullTruck") {
      add4x5 = 120;
      add4x8 = 80;
    } 
    else if (action === "splitTruck") {
      add4x5 = 60;
      add4x8 = 40;
    } 
    else if (action === "custom") {
      add4x5 = Number(qty4x5);
      add4x8 = Number(qty4x8);
    } 
    else if (action === "sell") {
      add4x5 = -Math.abs(Number(qty4x5));
      add4x8 = -Math.abs(Number(qty4x8));
    }

    // Update inventory (4x5 = item_id 1, 4x8 = item_id 2)
    const updates = [
      pool.query(
        `UPDATE inventory 
         SET quantity = quantity + $1 
         WHERE location_id = $2 AND item_id = 1`,
        [add4x5, locationId]
      ),
      pool.query(
        `UPDATE inventory 
         SET quantity = quantity + $1 
         WHERE location_id = $2 AND item_id = 2`,
        [add4x8, locationId]
      ),
    ];

    await Promise.all(updates);

    // Insert transaction logs
    await pool.query(
      `INSERT INTO transactions (location_id, item_id, quantity, type)
       VALUES 
         ($1, 1, $2, $3),
         ($1, 2, $4, $3)`,
      [locationId, add4x5, action === "sell" ? "sell" : "add", add4x8]
    );

    // Return updated inventory
    const { rows: updatedInventory } = await pool.query(
      `SELECT i.location_id, i.item_id, i.quantity, items.type 
       FROM inventory i
       JOIN items ON items.id = i.item_id
       WHERE location_id = $1`,
      [locationId]
    );

    res.json({
      status: "ok",
      inventory: updatedInventory,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Action failed", details: err.message });
  }
});

export default router;

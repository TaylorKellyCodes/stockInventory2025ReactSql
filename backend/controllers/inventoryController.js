import { pool } from "../db/index.js";

// FULL TRUCK VALUES — editable if needed
const FULL_TRUCK_4x5 = 1000;
const FULL_TRUCK_4x8 = 640;

export const getInventory = async (req, res) => {
  const result = await pool.query(`
    SELECT 
      locations.id,
      locations.name,
      json_agg(
        json_build_object(
          'sku', items.type,
          'quantity', inventory.quantity,
          'price', items.price,
          'profit', items.profit
        )
      ) as items,
      COALESCE(SUM(inventory.quantity * items.price), 0)::bigint as inventory_value_cents,
      COALESCE(SUM(
        CASE WHEN transactions.type = 'sell' 
          THEN transactions.quantity * items.profit 
          ELSE 0 
        END
      ), 0)::bigint as profit_cents,
      json_agg(
        json_build_object(
          'id', transactions.id,
          'qty4x5', CASE WHEN items.type = '4x5' THEN transactions.quantity ELSE 0 END,
          'qty4x8', CASE WHEN items.type = '4x8' THEN transactions.quantity ELSE 0 END,
          'type', transactions.type,
          'date', transactions.transaction_date,
          'created_at', transactions.created_at
        ) ORDER BY transactions.created_at DESC
      ) FILTER (WHERE transactions.id IS NOT NULL) as transactions
    FROM locations
    LEFT JOIN inventory ON locations.id = inventory.location_id
    LEFT JOIN items ON items.id = inventory.item_id
    LEFT JOIN transactions ON locations.id = transactions.location_id
    GROUP BY locations.id, locations.name
  `);

  res.json({ locations: result.rows });
};

export const addTruck = async (req, res) => {
  const { locationId, mode, truckType, transactionDate } = req.body;
  const txDate = transactionDate || new Date().toISOString().split('T')[0];

  // For full truck, use truckType (4x5 or 4x8) to determine quantities
  let quantities = {};
  
  if (truckType) {
    // Full truck of specific type - ONLY add one type
    if (truckType === "4x5") {
      quantities = { "4x5": FULL_TRUCK_4x5 };
    } else if (truckType === "4x8") {
      quantities = { "4x8": FULL_TRUCK_4x8 };
    }
  } else {
    // Split truck (50/50)
    quantities = {
      "4x5": 500,
      "4x8": 300
    };
  }

  for (const [type, qty] of Object.entries(quantities)) {
    if (qty > 0) {
      await pool.query(`
        UPDATE inventory 
        SET quantity = quantity + $1
        WHERE location_id = $2 AND 
              item_id = (SELECT id FROM items WHERE type = $3)
      `, [qty, locationId, type]);

      await pool.query(`
        INSERT INTO transactions (location_id, item_id, quantity, type, transaction_date)
        VALUES ($1, (SELECT id FROM items WHERE type=$2), $3, 'add', $4)
      `, [locationId, type, qty, txDate]);
    }
  }

  res.json({ message: "Truck added" });
};

export const addCustom = async (req, res) => {
  const { locationId, qty4x5, qty4x8, transactionDate } = req.body;
  const txDate = transactionDate || new Date().toISOString().split('T')[0];

  const updates = [
    ["4x5", qty4x5],
    ["4x8", qty4x8]
  ];

  for (const [type, qty] of updates) {
    if (qty > 0) {
      await pool.query(`
        UPDATE inventory 
        SET quantity = quantity + $1
        WHERE location_id = $2 AND 
              item_id = (SELECT id FROM items WHERE type = $3)
      `, [qty, locationId, type]);

      await pool.query(`
        INSERT INTO transactions (location_id, item_id, quantity, type, transaction_date)
        VALUES ($1, (SELECT id FROM items WHERE type=$2), $3, 'add', $4)
      `, [locationId, type, qty, txDate]);
    }
  }

  res.json({ message: "Custom amounts added" });
};

export const sell = async (req, res) => {
  const { locationId, type, quantity, transactionDate } = req.body;
  const txDate = transactionDate || new Date().toISOString().split('T')[0];

  await pool.query(`
    UPDATE inventory 
    SET quantity = quantity - $1
    WHERE location_id = $2 AND 
          item_id = (SELECT id FROM items WHERE type = $3)
  `, [quantity, locationId, type]);

  await pool.query(`
    INSERT INTO transactions (location_id, item_id, quantity, type, transaction_date)
    VALUES ($1, (SELECT id FROM items WHERE type=$2), $3, 'sell', $4)
  `, [locationId, type, quantity, txDate]);

  res.json({ message: "Sale recorded" });
};

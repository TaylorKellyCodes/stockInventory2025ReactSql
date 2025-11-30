import pkg from "pg";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialize database schema
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const initializeDatabase = async () => {
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    const queries = schema.split(';').filter(q => q.trim());
    
    for (const query of queries) {
      if (query.trim()) {
        try {
          await pool.query(query);
        } catch (err) {
          console.error("Query error:", err.message);
          console.error("Query:", query.substring(0, 100));
        }
      }
    }
    
    // Verify items were created with correct prices
    const itemsCheck = await pool.query('SELECT * FROM items');
    console.log("Items table contents:", itemsCheck.rows);
    console.log("Database schema initialized successfully");
  } catch (err) {
    console.error("Error initializing database:", err);
  }
};

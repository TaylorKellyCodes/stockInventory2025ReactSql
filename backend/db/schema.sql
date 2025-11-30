DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS locations CASCADE;

CREATE TABLE IF NOT EXISTS locations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

INSERT INTO locations (name)
VALUES ('Durham'), ('Concord');

CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL,     -- "4x5" or "4x8"
  price INTEGER NOT NULL, -- cents: 1200 = $12, 2000 = $20 (cost in inventory)
  profit INTEGER NOT NULL -- cents: 300 = $3, 500 = $5 (profit per sheet sold)
);

INSERT INTO items (type, price, profit)
VALUES ('4x5', 1200, 300), ('4x8', 2000, 500);

CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  location_id INTEGER REFERENCES locations(id),
  item_id INTEGER REFERENCES items(id),
  quantity INTEGER DEFAULT 0,
  UNIQUE(location_id, item_id)
);

-- Create inventory rows per item per location
INSERT INTO inventory (location_id, item_id, quantity)
VALUES
  (1, 1, 0),
  (1, 2, 0),
  (2, 1, 0),
  (2, 2, 0);

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  location_id INTEGER REFERENCES locations(id),
  item_id INTEGER REFERENCES items(id),
  quantity INTEGER NOT NULL,
  type TEXT NOT NULL, -- "add" or "sell"
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

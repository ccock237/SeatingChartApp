CREATE TABLE IF NOT EXISTS DiningTable (
  table_id INTEGER PRIMARY KEY,
  table_number INTEGER NOT NULL,
  grid_row INTEGER NOT NULL,
  grid_col INTEGER NOT NULL,
  type TEXT NOT NULL
);

INSERT OR REPLACE INTO DiningTable (table_id, table_number, grid_row, grid_col, type) VALUES
  (1, 1, 1, 1, "Round"),
  (2, 2, 2, 1, "Round"),
  (3, 3, 3, 1, "Round"),
  (4, 4, 4, 1, "Round"),
  (5, 5, 5, 1, "Round"),
  (6, 6, 1, 2, "Round"),
  (7, 7, 2, 2, "Round"),
  (8, 8, 3, 2, "Round"),
  (9, 9, 4, 2, "Round"),
  (10, 10, 5, 2, "Round"),
  (11, 11, 1, 3, "Round"),
  (12, 12, 2, 3, "Round"),
  (13, 13, 3, 3, "Round"),
  (14, 14, 4, 3, "Round"),
  (15, 15, 5, 3, "Round");
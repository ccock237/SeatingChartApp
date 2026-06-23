CREATE TABLE IF NOT EXISTS Person (
  person_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  table_id INTEGER NOT NULL,
  FOREIGN KEY (table_id) REFERENCES DiningTable(table_id)
);

INSERT OR REPLACE INTO Person (person_id, name, table_id) VALUES
  (1, 'John Doe', 1),
  (2, 'Jane Smith', 1),
  (3, 'Alice Johnson', 2),
  (4, 'Michael Brown', 2),
  (5, 'Joe Doe', 3),
  (6, 'Emily Davis', 3),
  (7, 'Daniel Wilson', 3),
  (8, 'Sarah Miller', 4),
  (9, 'Matthew Taylor', 4),
  (10, 'Olivia Anderson', 5),
  (11, 'James Thomas', 5),
  (12, 'Sophia Jackson', 6),
  (13, 'William White', 6),
  (14, 'Ava Harris', 7),
  (15, 'Benjamin Martin', 7),
  (16, 'Mia Thompson', 8),
  (17, 'Elijah Garcia', 8),
  (18, 'Charlotte Martinez', 9),
  (19, 'Lucas Robinson', 9),
  (20, 'Amelia Clark', 10),
  (21, 'Henry Rodriguez', 10);
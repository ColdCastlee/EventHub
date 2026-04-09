const db = require("./db");

const createEventsTable = `
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  location TEXT,
  status TEXT NOT NULL CHECK(status IN ('upcoming', 'ongoing', 'completed'))
);
`;

const createParticipantsTable = `
CREATE TABLE IF NOT EXISTS participants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK(role IN ('admin', 'viewer', 'participant'))
);
`;

const createRegistrationsTable = `
CREATE TABLE IF NOT EXISTS registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  participant_id INTEGER NOT NULL,
  event_id INTEGER NOT NULL,
  registered_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(participant_id, event_id),
  FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);
`;

db.serialize(() => {
  db.run("PRAGMA foreign_keys = ON");
  db.run(createEventsTable);
  db.run(createParticipantsTable);
  db.run(createRegistrationsTable);

  console.log("Database initialized successfully");
});

db.close((err) => {
  if (err) {
    console.error("Error closing database:", err.message);
  } else {
    console.log("Database connection closed");
  }
});
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const app = express();

app.use(express.json());

// DB
const db = new sqlite3.Database("./db.sqlite");

// 创建表
db.run(`
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  date TEXT
)
`);

// GET all
app.get("/events", (req, res) => {
  db.all("SELECT * FROM events", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// CREATE
app.post("/events", (req, res) => {
  const { title, date } = req.body;
  db.run(
    "INSERT INTO events (title, date) VALUES (?, ?)",
    [title, date],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, title, date });
    }
  );
});

// DELETE
app.delete("/events/:id", (req, res) => {
  db.run("DELETE FROM events WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Deleted" });
  });
});

// Start
app.listen(3001, () => {
  console.log("Node API running on port 3001");
});
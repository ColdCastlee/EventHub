const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ===== Fake DB =====
let events = [
  {
    id: 1,
    title: "Node Event",
    description: "This is a test event",
    location: "Paris",
  },
];

// Root route
app.get("/", (req, res) => {
  res.send("Node backend is running");
});

// GET all events
app.get("/events", (req, res) => {
  res.json(events);
});

// GET one event
app.get("/events/:id", (req, res) => {
  const event = events.find((e) => e.id == req.params.id);
  if (!event) return res.status(404).json({ error: "Not found" });
  res.json(event);
});

// CREATE event
app.post("/events", (req, res) => {
  const newEvent = {
    id: events.length + 1,
    ...req.body,
  };
  events.push(newEvent);
  res.json(newEvent);
});

// DELETE event
app.delete("/events/:id", (req, res) => {
  events = events.filter((e) => e.id != req.params.id);
  res.json({ message: "Deleted" });
});

// Start
app.listen(3001, () => {
  console.log("Node server running on http://localhost:3001");
});
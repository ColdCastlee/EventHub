const db = require("../db");
const { validateEvent } = require("../utils/validators");

function getAllEvents(req, res, next) {
  const { status, date } = req.query;

  let query = "SELECT * FROM events";
  const conditions = [];
  const params = [];

  if (status) {
    conditions.push("status = ?");
    params.push(status);
  }

  if (date) {
    conditions.push("date = ?");
    params.push(date);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " ORDER BY date ASC";

  db.all(query, params, (err, rows) => {
    if (err) return next(err);
    res.json(rows);
  });
}

function getEventById(req, res, next) {
  const { id } = req.params;

  db.get("SELECT * FROM events WHERE id = ?", [id], (err, row) => {
    if (err) return next(err);

    if (!row) {
      res.status(404);
      return next(new Error("Event not found"));
    }

    res.json(row);
  });
}

function createEvent(req, res, next) {
  const error = validateEvent(req.body);
  if (error) {
    res.status(400);
    return next(new Error(error));
  }

  const { title, description, date, location, status } = req.body;

  const query = `
    INSERT INTO events (title, description, date, location, status)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(query, [title, description || null, date, location || null, status], function (err) {
    if (err) return next(err);

    db.get("SELECT * FROM events WHERE id = ?", [this.lastID], (err2, row) => {
      if (err2) return next(err2);
      res.status(201).json(row);
    });
  });
}

function updateEvent(req, res, next) {
  const { id } = req.params;
  const error = validateEvent(req.body);

  if (error) {
    res.status(400);
    return next(new Error(error));
  }

  const { title, description, date, location, status } = req.body;

  db.get("SELECT * FROM events WHERE id = ?", [id], (err, existingEvent) => {
    if (err) return next(err);

    if (!existingEvent) {
      res.status(404);
      return next(new Error("Event not found"));
    }

    const query = `
      UPDATE events
      SET title = ?, description = ?, date = ?, location = ?, status = ?
      WHERE id = ?
    `;

    db.run(
      query,
      [title, description || null, date, location || null, status, id],
      function (err2) {
        if (err2) return next(err2);

        db.get("SELECT * FROM events WHERE id = ?", [id], (err3, row) => {
          if (err3) return next(err3);
          res.json(row);
        });
      }
    );
  });
}

function deleteEvent(req, res, next) {
  const { id } = req.params;

  db.get("SELECT * FROM events WHERE id = ?", [id], (err, existingEvent) => {
    if (err) return next(err);

    if (!existingEvent) {
      res.status(404);
      return next(new Error("Event not found"));
    }

    db.run("DELETE FROM events WHERE id = ?", [id], function (err2) {
      if (err2) return next(err2);

      res.json({
        message: "Event deleted successfully"
      });
    });
  });
}

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
};
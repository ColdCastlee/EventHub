const db = require("../db");
const { validateParticipant } = require("../utils/validators");

function getAllParticipants(req, res, next) {
  const { role } = req.query;

  let query = "SELECT * FROM participants";
  const params = [];

  if (role) {
    query += " WHERE role = ?";
    params.push(role);
  }

  query += " ORDER BY id DESC";

  db.all(query, params, (err, rows) => {
    if (err) return next(err);
    res.json(rows);
  });
}

function getParticipantById(req, res, next) {
  const { id } = req.params;

  db.get("SELECT * FROM participants WHERE id = ?", [id], (err, participant) => {
    if (err) return next(err);

    if (!participant) {
      res.status(404);
      return next(new Error("Participant not found"));
    }

    const registrationQuery = `
      SELECT r.id AS registration_id, e.id AS event_id, e.title, e.date, e.location, e.status
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      WHERE r.participant_id = ?
      ORDER BY e.date ASC
    `;

    db.all(registrationQuery, [id], (err2, registrations) => {
      if (err2) return next(err2);

      res.json({
        ...participant,
        registered_events: registrations
      });
    });
  });
}

function createParticipant(req, res, next) {
  const error = validateParticipant(req.body);

  if (error) {
    res.status(400);
    return next(new Error(error));
  }

  const { name, email, role } = req.body;

  const query = `
    INSERT INTO participants (name, email, role)
    VALUES (?, ?, ?)
  `;

  db.run(query, [name, email, role], function (err) {
    if (err) {
      if (err.message.includes("UNIQUE constraint failed")) {
        res.status(400);
        return next(new Error("Email already exists"));
      }
      return next(err);
    }

    db.get("SELECT * FROM participants WHERE id = ?", [this.lastID], (err2, row) => {
      if (err2) return next(err2);
      res.status(201).json(row);
    });
  });
}

function updateParticipant(req, res, next) {
  const { id } = req.params;
  const error = validateParticipant(req.body);

  if (error) {
    res.status(400);
    return next(new Error(error));
  }

  const { name, email, role } = req.body;

  db.get("SELECT * FROM participants WHERE id = ?", [id], (err, existingParticipant) => {
    if (err) return next(err);

    if (!existingParticipant) {
      res.status(404);
      return next(new Error("Participant not found"));
    }

    const query = `
      UPDATE participants
      SET name = ?, email = ?, role = ?
      WHERE id = ?
    `;

    db.run(query, [name, email, role, id], function (err2) {
      if (err2) {
        if (err2.message.includes("UNIQUE constraint failed")) {
          res.status(400);
          return next(new Error("Email already exists"));
        }
        return next(err2);
      }

      db.get("SELECT * FROM participants WHERE id = ?", [id], (err3, row) => {
        if (err3) return next(err3);
        res.json(row);
      });
    });
  });
}

function deleteParticipant(req, res, next) {
  const { id } = req.params;

  db.get("SELECT * FROM participants WHERE id = ?", [id], (err, existingParticipant) => {
    if (err) return next(err);

    if (!existingParticipant) {
      res.status(404);
      return next(new Error("Participant not found"));
    }

    db.run("DELETE FROM participants WHERE id = ?", [id], function (err2) {
      if (err2) return next(err2);

      res.json({
        message: "Participant deleted successfully"
      });
    });
  });
}

module.exports = {
  getAllParticipants,
  getParticipantById,
  createParticipant,
  updateParticipant,
  deleteParticipant
};
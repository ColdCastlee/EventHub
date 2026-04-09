const db = require("../db");
const { validateRegistration } = require("../utils/validators");

function getAllRegistrations(req, res, next) {
  const query = `
    SELECT
      r.id,
      r.registered_at,
      p.id AS participant_id,
      p.name AS participant_name,
      p.email AS participant_email,
      p.role AS participant_role,
      e.id AS event_id,
      e.title AS event_title,
      e.date AS event_date,
      e.location AS event_location,
      e.status AS event_status
    FROM registrations r
    JOIN participants p ON r.participant_id = p.id
    JOIN events e ON r.event_id = e.id
    ORDER BY r.registered_at DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) return next(err);
    res.json(rows);
  });
}

function getRegistrationById(req, res, next) {
  const { id } = req.params;

  const query = `
    SELECT
      r.id,
      r.registered_at,
      p.id AS participant_id,
      p.name AS participant_name,
      p.email AS participant_email,
      p.role AS participant_role,
      e.id AS event_id,
      e.title AS event_title,
      e.date AS event_date,
      e.location AS event_location,
      e.status AS event_status
    FROM registrations r
    JOIN participants p ON r.participant_id = p.id
    JOIN events e ON r.event_id = e.id
    WHERE r.id = ?
  `;

  db.get(query, [id], (err, row) => {
    if (err) return next(err);

    if (!row) {
      res.status(404);
      return next(new Error("Registration not found"));
    }

    res.json(row);
  });
}

function createRegistration(req, res, next) {
  const error = validateRegistration(req.body);

  if (error) {
    res.status(400);
    return next(new Error(error));
  }

  const participantId = Number(req.body.participant_id);
  const eventId = Number(req.body.event_id);

  db.get("SELECT * FROM participants WHERE id = ?", [participantId], (err, participant) => {
    if (err) return next(err);

    if (!participant) {
      res.status(404);
      return next(new Error("Participant not found"));
    }

    db.get("SELECT * FROM events WHERE id = ?", [eventId], (err2, event) => {
      if (err2) return next(err2);

      if (!event) {
        res.status(404);
        return next(new Error("Event not found"));
      }

      const query = `
        INSERT INTO registrations (participant_id, event_id)
        VALUES (?, ?)
      `;

      db.run(query, [participantId, eventId], function (err3) {
        if (err3) {
          if (err3.message.includes("UNIQUE constraint failed")) {
            res.status(400);
            return next(new Error("This participant is already registered for this event"));
          }
          return next(err3);
        }

        const detailQuery = `
          SELECT
            r.id,
            r.registered_at,
            p.id AS participant_id,
            p.name AS participant_name,
            p.email AS participant_email,
            p.role AS participant_role,
            e.id AS event_id,
            e.title AS event_title,
            e.date AS event_date,
            e.location AS event_location,
            e.status AS event_status
          FROM registrations r
          JOIN participants p ON r.participant_id = p.id
          JOIN events e ON r.event_id = e.id
          WHERE r.id = ?
        `;

        db.get(detailQuery, [this.lastID], (err4, row) => {
          if (err4) return next(err4);
          res.status(201).json(row);
        });
      });
    });
  });
}

function deleteRegistration(req, res, next) {
  const { id } = req.params;

  db.get("SELECT * FROM registrations WHERE id = ?", [id], (err, registration) => {
    if (err) return next(err);

    if (!registration) {
      res.status(404);
      return next(new Error("Registration not found"));
    }

    db.run("DELETE FROM registrations WHERE id = ?", [id], function (err2) {
      if (err2) return next(err2);

      res.json({
        message: "Registration deleted successfully"
      });
    });
  });
}

module.exports = {
  getAllRegistrations,
  getRegistrationById,
  createRegistration,
  deleteRegistration
};
function validateEvent(data) {
  const { title, date, status } = data;

  if (!title || typeof title !== "string" || !title.trim()) {
    return "Title is required";
  }

  if (!date || typeof date !== "string" || !date.trim()) {
    return "Date is required";
  }

  if (!status || !["upcoming", "ongoing", "completed"].includes(status)) {
    return "Status must be one of: upcoming, ongoing, completed";
  }

  return null;
}

function validateParticipant(data) {
  const { name, email, role } = data;

  if (!name || typeof name !== "string" || !name.trim()) {
    return "Name is required";
  }

  if (!email || typeof email !== "string" || !email.trim()) {
    return "Email is required";
  }

  if (!role || !["admin", "viewer", "participant"].includes(role)) {
    return "Role must be one of: admin, viewer, participant";
  }

  return null;
}

function validateRegistration(data) {
  const { participant_id, event_id } = data;

  if (!participant_id || isNaN(Number(participant_id))) {
    return "participant_id is required and must be a number";
  }

  if (!event_id || isNaN(Number(event_id))) {
    return "event_id is required and must be a number";
  }

  return null;
}

module.exports = {
  validateEvent,
  validateParticipant,
  validateRegistration
};
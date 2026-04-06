import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "../styles/participants.css";

function Participants() {
  const [participants, setParticipants] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("access");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [participantsRes, userRes] = await Promise.all([
          axios.get("http://127.0.0.1:8000/api/participants/", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          axios.get("http://127.0.0.1:8000/api/me/", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        setParticipants(participantsRes.data);
        setCurrentUser(userRes.data);
      } catch (err) {
        console.error(err);
        setMessage("Failed to load participants.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const isAdmin = currentUser?.is_staff || currentUser?.is_superuser;

  return (
    <>
      <Navbar />

      <div className="participants-page">
        <div className="participants-header">
          <h2 className="participants-title">
            {isAdmin ? "Participants Management" : "Participants"}
          </h2>

          <p className="participants-subtitle">
            {isAdmin
              ? "View all participant profiles across the platform"
              : "View all registered participants"}
          </p>
        </div>

        {isAdmin && (
          <div className="participants-admin-panel">
            <div className="participants-admin-card">
              <span className="participants-admin-label">Total Participants</span>
              <span className="participants-admin-value">{participants.length}</span>
            </div>
          </div>
        )}

        {message && <p className="participants-message">{message}</p>}

        {loading ? (
          <div className="participants-empty">Loading participants...</div>
        ) : participants.length > 0 ? (
          <div className="participants-list">
            {participants.map((participant) => (
              <div key={participant.id} className="participant-card">
                <div className="participant-card-left">
                  <h3 className="participant-name">
                    {participant.first_name} {participant.last_name}
                  </h3>

                  <p className="participant-detail">
                    <strong>Email:</strong> {participant.email}
                  </p>

                  <p className="participant-detail">
                    <strong>Phone:</strong>{" "}
                    {participant.phone ? participant.phone : "N/A"}
                  </p>

                  {isAdmin && (
                    <p className="participant-detail">
                      <strong>ID:</strong> {participant.id}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="participants-empty">No participants found.</div>
        )}
      </div>
    </>
  );
}

export default Participants;
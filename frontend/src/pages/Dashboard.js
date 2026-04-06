import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/dashboard.css";

function Dashboard() {
  const [events, setEvents] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("access");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, participantsRes, registrationsRes, meRes] =
          await Promise.all([
            axios.get("http://127.0.0.1:8000/api/events/", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get("http://127.0.0.1:8000/api/participants/", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get("http://127.0.0.1:8000/api/registrations/", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get("http://127.0.0.1:8000/api/me/", {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

        const allEvents = eventsRes.data;
        const allParticipants = participantsRes.data;
        const allRegistrations = registrationsRes.data;
        const user = meRes.data;

        setEvents(allEvents);
        setParticipants(allParticipants);
        setRegistrations(allRegistrations);
        setCurrentUser(user);

        const myParticipant = allParticipants.find((p) => p.user === user.id);

        if (myParticipant) {
          const myEventIds = allRegistrations
            .filter((r) => r.participant === myParticipant.id)
            .map((r) => r.event);

          const registeredEvents = allEvents.filter((event) =>
            myEventIds.includes(event.id)
          );

          setMyEvents(registeredEvents);
        } else {
          setMyEvents([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const isAdmin = currentUser?.is_staff || currentUser?.is_superuser;

  const activeEvents = useMemo(() => {
    return events.filter((event) => event.status === "ongoing");
  }, [events]);

  const comingEvents = useMemo(() => {
    return events.filter((event) => event.status === "coming");
  }, [events]);

  const recentRegistrations = useMemo(() => {
    return [...registrations].slice(-5).reverse();
  }, [registrations]);

  const formatDateTime = (value) => {
    if (!value) return "N/A";
    return new Date(value).toLocaleString();
  };

  const formatStatus = (status) => {
    switch (status) {
      case "coming":
        return "Coming";
      case "ongoing":
        return "Ongoing";
      case "finished":
        return "Finished";
      default:
        return status;
    }
  };

  const renderOverviewCards = () => (
    <div className="stats-grid">
      <div className="stat-card">
        <h3>Total Events</h3>
        <p>{events.length}</p>
      </div>

      <div className="stat-card">
        <h3>Total Participants</h3>
        <p>{participants.length}</p>
      </div>

      <div className="stat-card">
        <h3>Total Registrations</h3>
        <p>{registrations.length}</p>
      </div>
    </div>
  );

  const renderMyEvents = () => (
    <div className="dashboard-section">
      <h3>My Registered Events</h3>

      {loading ? (
        <p>Loading...</p>
      ) : myEvents.length > 0 ? (
        myEvents.map((event) => (
          <div key={event.id} className="my-event-card">
            <h4>{event.title}</h4>

            <p>
              <strong>Status:</strong>{" "}
              <span className={`status-badge ${event.status}`}>
                {formatStatus(event.status)}
              </span>
            </p>

            <p>
              <strong>Start:</strong> {formatDateTime(event.start_time)}
            </p>

            <p>
              <strong>End:</strong> {formatDateTime(event.end_time)}
            </p>

            <p>
              <strong>Location:</strong> {event.location}
            </p>

            <Link
              to={`/events/${event.id}`}
              state={{ from: "/dashboard" }}
              className="my-event-link"
            >
              View Details
            </Link>
          </div>
        ))
      ) : (
        <p>You have not registered for any events yet.</p>
      )}
    </div>
  );

  const renderAdminPanel = () => (
    <>
      <div className="dashboard-section">
        <h3>Active Events</h3>

        {activeEvents.length > 0 ? (
          activeEvents.map((event) => (
            <div key={event.id} className="dashboard-row">
              <div className="dashboard-row-left">
                <span className="dashboard-row-title">{event.title}</span>
                <span className={`status-badge ${event.status}`}>
                  {formatStatus(event.status)}
                </span>
              </div>

              <Link
                to={`/events/${event.id}`}
                state={{ from: "/dashboard" }}
                className="dashboard-row-link"
              >
                View
              </Link>
            </div>
          ))
        ) : (
          <p>No active events.</p>
        )}
      </div>

      <div className="dashboard-section">
        <h3>Quick Actions</h3>

        <div className="quick-actions">
          <Link to="/events" className="action-btn primary">
            Manage Events
          </Link>

          <Link to="/participants" className="action-btn">
            View Participants
          </Link>
        </div>
      </div>

      <div className="dashboard-section">
        <h3>Upcoming Events</h3>

        {comingEvents.length > 0 ? (
          comingEvents.map((event) => (
            <div key={event.id} className="dashboard-row">
              <div className="dashboard-row-left">
                <span className="dashboard-row-title">{event.title}</span>
                <span className={`status-badge ${event.status}`}>
                  {formatStatus(event.status)}
                </span>
              </div>

              <Link
                to={`/events/${event.id}`}
                state={{ from: "/dashboard" }}
                className="dashboard-row-link"
              >
                View
              </Link>
            </div>
          ))
        ) : (
          <p>No upcoming events.</p>
        )}
      </div>

      <div className="dashboard-section">
        <h3>Recent Registrations</h3>

        {recentRegistrations.length > 0 ? (
          recentRegistrations.map((registration) => {
            const event = events.find((e) => e.id === registration.event);

            return (
              <div key={registration.id} className="dashboard-row">
                <div className="dashboard-row-left">
                  <span className="dashboard-row-title">
                    {registration.participant_name || `Participant #${registration.participant}`}
                  </span>
                  <span className="dashboard-row-subtitle">
                    {event ? event.title : `Event #${registration.event}`}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <p>No registrations yet.</p>
        )}
      </div>
    </>
  );

  return (
    <>
      <Navbar />

      <div className="dashboard-page">
        <h2 className="dashboard-title">
          {isAdmin ? "Admin Dashboard" : "Dashboard"}
        </h2>

        {renderOverviewCards()}

        {isAdmin ? renderAdminPanel() : renderMyEvents()}
      </div>
    </>
  );
}

export default Dashboard;
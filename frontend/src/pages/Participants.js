import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "../styles/participants.css";
import API_BASE_URL from "../config";

function Participants() {
  const [participants, setParticipants] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [myParticipant, setMyParticipant] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);

  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  const [createForm, setCreateForm] = useState({
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "participant",
  });

  const token = localStorage.getItem("access");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setMessage("");

    try {
      const headers = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const userRes = await axios.get(`${API_BASE_URL}/api/me/`, headers);
      const user = userRes.data;
      setCurrentUser(user);

      const admin =
        user?.role === "admin" ||
        user?.participant?.role === "admin" ||
        user?.is_staff ||
        user?.is_superuser;

      const participantsRes = await axios.get(
        `${API_BASE_URL}/api/participants/`,
        headers
      );
      setParticipants(participantsRes.data);

      if (!admin) {
        try {
          const myRes = await axios.get(
            `${API_BASE_URL}/api/participants/me/`,
            headers
          );
          const data = myRes.data;
          setMyParticipant(data);
          setEditForm({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            email: data.email || "",
            phone: data.phone || "",
          });
        } catch {
          setMyParticipant(null);
          setMessage("No participant profile found.");
        }
      } else {
        setMyParticipant(null);
      }
    } catch {
      setMessage("Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setMessage("Not authenticated.");
      setLoading(false);
      return;
    }
    fetchData();
  }, [fetchData, token]);

  const isAdmin =
    currentUser?.role === "admin" ||
    currentUser?.participant?.role === "admin" ||
    currentUser?.is_staff ||
    currentUser?.is_superuser;

  const handleChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleCreateChange = (e) => {
    setCreateForm({ ...createForm, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await axios.patch(
        `${API_BASE_URL}/api/participants/me/`,
        editForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMyParticipant(res.data);
      setMessage("Profile updated.");
    } catch {
      setMessage("Update failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this participant?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/participants/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch {
      setMessage("Delete failed.");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      await axios.post(
        `${API_BASE_URL}/api/participants/`,
        createForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage("Created.");
      setCreateForm({
        username: "",
        password: "",
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        role: "participant",
      });

      fetchData();
    } catch {
      setMessage("Create failed.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="participants-page">
        <h2>
          {isAdmin ? "Participants Management" : "My Participant Profile"}
        </h2>

        {message && <p>{message}</p>}

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            {!isAdmin && (
              <div>
                {myParticipant ? (
                  <form onSubmit={handleProfileUpdate}>
                    <input
                      name="first_name"
                      value={editForm.first_name}
                      onChange={handleChange}
                    />
                    <input
                      name="last_name"
                      value={editForm.last_name}
                      onChange={handleChange}
                    />
                    <input
                      name="email"
                      value={editForm.email}
                      onChange={handleChange}
                    />
                    <input
                      name="phone"
                      value={editForm.phone}
                      onChange={handleChange}
                    />
                    <button disabled={saving}>
                      {saving ? "Saving..." : "Update"}
                    </button>
                  </form>
                ) : (
                  <p>No profile found</p>
                )}
              </div>
            )}

            {isAdmin && (
              <>
                <form onSubmit={handleCreate}>
                  <input
                    name="username"
                    value={createForm.username}
                    onChange={handleCreateChange}
                    required
                  />
                  <input
                    type="password"
                    name="password"
                    value={createForm.password}
                    onChange={handleCreateChange}
                    required
                  />
                  <button disabled={creating}>
                    {creating ? "Creating..." : "Create"}
                  </button>
                </form>

                {participants.map((p) => (
                  <div key={p.id}>
                    {p.first_name} {p.last_name} ({p.role})
                    <button onClick={() => handleDelete(p.id)}>
                      Delete
                    </button>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default Participants;
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/navbar.css";

function Navbar() {
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("access");

      if (!token) {
        setCurrentUser(null);
        return;
      }

      try {
        const res = await axios.get("http://127.0.0.1:8000/api/me/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setCurrentUser(res.data);
      } catch (err) {
        console.error("Failed to load current user:", err);
        setCurrentUser(null);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link className="navbar-link" to="/dashboard">
          Dashboard
        </Link>
        <span className="navbar-separator">|</span>

        <Link className="navbar-link" to="/events">
          Events
        </Link>
        <span className="navbar-separator">|</span>

        <Link className="navbar-link" to="/participants">
          Participants
        </Link>
      </div>

      <div className="navbar-right">
        <span className="navbar-user">
          {currentUser?.username || "User"}
        </span>
        <span className="navbar-separator">|</span>

        <button className="navbar-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
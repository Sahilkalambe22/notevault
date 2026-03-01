import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const Settings = (props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  /* ================= FETCH USER ================= */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/getuser", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": localStorage.getItem("token"),
          },
        });

        const data = await res.json();

        setForm((prev) => ({
          ...prev,
          name: data.name || "",
          email: data.email || "",
        }));

        // keep name synced for navbar
        localStorage.setItem("name", data.name || "");
      } catch (err) {
        console.error("Failed to fetch user", err);
        props.showAlert("Failed to load user data", "danger");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [props]);

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (form.password && form.password !== form.confirmPassword) {
      props.showAlert("Passwords do not match", "warning");
      return;
    }

    try {
      await fetch("http://localhost:5000/api/auth/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("token"),
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password || undefined,
        }),
      });

      localStorage.setItem("name", form.name);
      setIsEditing(false);
      props.showAlert("Profile updated successfully", "success");
    } catch (err) {
      console.error("Update failed", err);
      props.showAlert("Update failed", "danger");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setForm((prev) => ({
      ...prev,
      password: "",
      confirmPassword: "",
    }));
  };

  if (loading) return null;

  /* ================= UI ================= */
 return (
  <div className="settings-layout">
    <motion.div
      className="settings-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* ================= PROFILE HEADER ================= */}
      <div className="settings-profile">
        <div className="settings-avatar">
          {form.name ? form.name.charAt(0).toUpperCase() : "U"}
        </div>
        <h3>{form.name}</h3>
        <p>{form.email}</p>
      </div>

      {/* ================= ACCOUNT STATS ================= */}
      <div className="settings-section">
        <h4>Account Activity</h4>
        <div className="settings-stats">
          <div>
            <span>Total Notes</span>
            <b>{localStorage.getItem("noteCount") || 0}</b>
          </div>
          <div>
            <span>Pinned</span>
            <b>{localStorage.getItem("pinnedCount") || 0}</b>
          </div>
        </div>
      </div>

      {/* ================= PROFILE INFO ================= */}
      <div className="settings-section">
        <h4>Profile Information</h4>

        {!isEditing ? (
          <>
            <div className="settings-row">
              <span>Name</span>
              <b>{form.name}</b>
            </div>

            <div className="settings-row">
              <span>Email</span>
              <b>{form.email}</b>
            </div>

            <button
              className="settings-primary-btn"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          </>
        ) : (
          <form onSubmit={handleSave} className="settings-form">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Name"
              required
            />

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              required
            />

            <div className="settings-actions">
              <button className="settings-primary-btn" type="submit">
                Save
              </button>
              <button
                className="settings-secondary-btn"
                type="button"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ================= SECURITY ================= */}
      <div className="settings-section">
        <h4>Security</h4>

        <button className="settings-secondary-btn">
          Change Password
        </button>

        <button className="settings-secondary-btn">
          Logout From All Devices
        </button>
      </div>

      {/* ================= DANGER ZONE ================= */}
      <div className="settings-section danger-zone">
        <h4>Danger Zone</h4>

        <button className="settings-danger-btn">
          Delete Account
        </button>
      </div>
    </motion.div>
  </div>
);
};

export default Settings;

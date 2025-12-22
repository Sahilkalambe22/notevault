import React, { useEffect, useState } from "react";

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
      <div className="settings-card">
        <h2>Account Settings</h2>

        {!isEditing ? (
          <div className="settings-view">
            <div className="settings-row">
              <span>Name</span>
              <b>{form.name}</b>
            </div>

            <div className="settings-row">
              <span>Email</span>
              <b>{form.email || "Not set"}</b>
            </div>

            <div className="settings-row">
              <span>Password</span>
              <b>********</b>
            </div>

            <button
              className="settings-edit-btn"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </button>
          </div>
        ) : (
          <form className="settings-form" onSubmit={handleSave}>
            <label>
              Name
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Email
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              New Password
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
              />
            </label>

            <label>
              Confirm Password
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
              />
            </label>

            <div className="settings-actions">
              <button className="settings-save" type="submit">
                Save
              </button>
              <button
                className="settings-cancel"
                type="button"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Settings;

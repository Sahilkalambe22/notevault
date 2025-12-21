import React, { useState, useRef } from "react";

const Settings = () => {
  const fileRef = useRef(null);

  // Prefill from localStorage (or context later)
  const [form, setForm] = useState({
    name: localStorage.getItem("name") || "",
    email: localStorage.getItem("email") || "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (form.password && form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    // 🔗 Backend API call later
    console.log("Updated profile:", form);

    // Temporary localStorage update
    localStorage.setItem("name", form.name);
    localStorage.setItem("email", form.email);

    alert("Profile updated successfully");
  };

  return (
    <div className="settings-layout">
      <div className="settings-card">
        <h2>Account Settings</h2>

        <form onSubmit={handleSave} className="settings-form">
          {/* NAME */}
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

          {/* EMAIL */}
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



          {/* PASSWORD */}
          <label>
            New Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Leave blank to keep current"
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

          <button className="settings-save" type="submit">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./Settings.css";

const Settings = (props) => {
	const navigate = useNavigate();

	const [isEditing, setIsEditing] = useState(false);
	const [loading, setLoading] = useState(true);
	const [showPasswordForm, setShowPasswordForm] = useState(false);

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

				localStorage.setItem("name", data.name || "");
			} catch (err) {
				props.showAlert("Failed to load user data", "danger");
			} finally {
				setLoading(false);
			}
		};

		fetchUser();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	/* ================= HANDLERS ================= */

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	/* -------- PROFILE UPDATE -------- */
	const handleSave = async (e) => {
		e.preventDefault();

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
				}),
			});

			localStorage.setItem("name", form.name);
			setIsEditing(false);
			props.showAlert("Profile updated successfully", "success");
		} catch (err) {
			props.showAlert("Update failed", "danger");
		}
	};

	/* -------- PASSWORD UPDATE -------- */
	const handlePasswordUpdate = async (e) => {
		e.preventDefault();

		if (!form.password || !form.confirmPassword) {
			props.showAlert("Fill all fields", "warning");
			return;
		}

		if (form.password !== form.confirmPassword) {
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
					password: form.password,
				}),
			});

			props.showAlert("Password updated", "success");

			setForm({
				...form,
				password: "",
				confirmPassword: "",
			});

			setShowPasswordForm(false);
		} catch (err) {
			props.showAlert("Password update failed", "danger");
		}
	};

	/* -------- LOGOUT -------- */
	const handleLogoutAll = () => {
		const confirmLogout = window.confirm("Are you sure you want to logout from all devices?");

		if (!confirmLogout) return;

		localStorage.removeItem("token");
		localStorage.removeItem("name");

		props.showAlert("Logged out successfully", "success");
		navigate("/login");
	};

	/* -------- DELETE ACCOUNT -------- */
	const handleDeleteAccount = async () => {
		const confirmDelete = window.confirm("This will permanently delete your account and all notes. This action cannot be undone. Continue?");

		if (!confirmDelete) return;

		try {
			await fetch("http://localhost:5000/api/auth/delete", {
				method: "DELETE",
				headers: {
					"auth-token": localStorage.getItem("token"),
				},
			});

			localStorage.clear();
			props.showAlert("Account deleted successfully", "success");
			navigate("/");
		} catch (err) {
			props.showAlert("Delete failed", "danger");
		}
	};

	const handleCancel = () => {
		setIsEditing(false);
	};

	if (loading) return null;

	/* ================= UI ================= */

	return (
		<div className="settings-layout">
			<motion.div className="settings-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
				{/* PROFILE HEADER */}
				<div className="settings-profile">
					<div className="settings-avatar">{form.name ? form.name.charAt(0).toUpperCase() : "U"}</div>
					<h3>{form.name}</h3>
					<p>{form.email}</p>
				</div>

				{/* PROFILE INFO */}
				<div className="settings-section">
					<h4>Profile Information</h4>

					{!isEditing ? (
						<button className="settings-primary-btn" onClick={() => setIsEditing(true)}>
							Edit Profile
						</button>
					) : (
						<form onSubmit={handleSave} className="settings-form">
							<input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Name" required />

							<input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" required />

							<div className="settings-actions">
								<button className="settings-primary-btn" type="submit">
									Save
								</button>
								<button className="settings-secondary-btn" type="button" onClick={handleCancel}>
									Cancel
								</button>
							</div>
						</form>
					)}
				</div>

				{/* ================= SECURITY ================= */}
				<div className="settings-section">
					<h4>Security</h4>

					{!showPasswordForm ? (
						<button className="settings-secondary-btn" onClick={() => setShowPasswordForm(true)}>
							Change Password
						</button>
					) : (
						<>
							<form onSubmit={handlePasswordUpdate} className="settings-form">
								<input type="password" name="password" placeholder="New Password" value={form.password} onChange={handleChange} />

								<input type="password" name="confirmPassword" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} />

								<div className="settings-actions">
									<button className="settings-primary-btn" type="submit">
										Update Password
									</button>

									<button
										type="button"
										className="settings-secondary-btn"
										onClick={() => {
											setShowPasswordForm(false);
											setForm({
												...form,
												password: "",
												confirmPassword: "",
											});
										}}
									>
										Cancel
									</button>
								</div>
							</form>
						</>
					)}

					<button className="settings-secondary-btn" onClick={handleLogoutAll}>
						Logout From All Devices
					</button>
				</div>

				{/* DANGER ZONE */}
				<div className="settings-section danger-zone">
					<h4>Danger Zone</h4>

					<button className="settings-danger-btn" onClick={handleDeleteAccount}>
						Delete Account
					</button>
				</div>
			</motion.div>
		</div>
	);
};

export default Settings;

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./Settings.css";

const Settings = (props) => {
	const navigate = useNavigate();

	const [isEditing, setIsEditing] = useState(false);
	const [loading, setLoading] = useState(true);
	const [showPasswordForm, setShowPasswordForm] = useState(false);
	const [showAvatarPicker, setShowAvatarPicker] = useState(false);

	// Available DiceBear styles
	const avatarStyles = ["adventurer", "avataaars", "bottts", "pixel-art", "lorelei"];

	const [form, setForm] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
		joinedDate: "",
		avatar: "", // stored as "style:seed"
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
					joinedDate: data.date || "",
					avatar: data.avatar || "",
				}));

				localStorage.setItem("name", data.name || "");
				localStorage.setItem("avatar", data.avatar || "");
			} catch {
				props.showAlert("Failed to load user data", "danger");
			} finally {
				setLoading(false);
			}
		};

		fetchUser();
	}, []);

	/* ================= PARSE AVATAR ================= */
	const parsedAvatar = form.avatar ? form.avatar.split(":") : [];
	const selectedStyle = parsedAvatar[0];
	const selectedSeed = parsedAvatar[1];

	/* ================= HELPERS ================= */
	const formatDate = (dateString) => {
		if (!dateString) return "";
		const date = new Date(dateString);
		return date.toLocaleDateString("en-IN", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const generateRandomSeed = () => {
		return Math.random().toString(36).substring(2, 10);
	};

	/* ================= UPDATE AVATAR ================= */
	const handleAvatarSelect = async (style, seed) => {
		const avatarValue = style ? `${style}:${seed}` : "";

		try {
			await fetch("http://localhost:5000/api/auth/update", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					"auth-token": localStorage.getItem("token"),
				},
				body: JSON.stringify({ avatar: avatarValue }),
			});

			setForm({ ...form, avatar: avatarValue });
			setShowAvatarPicker(false);
			localStorage.setItem("avatar", avatarValue);
			props.showAlert("Avatar updated", "success");
		} catch {
			props.showAlert("Failed to update avatar", "danger");
		}
	};

	/* ================= PROFILE UPDATE ================= */
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
		} catch {
			props.showAlert("Update failed", "danger");
		}
	};

	/* ================= PASSWORD UPDATE ================= */
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
				body: JSON.stringify({ password: form.password }),
			});

			props.showAlert("Password updated", "success");

			setForm({
				...form,
				password: "",
				confirmPassword: "",
			});

			setShowPasswordForm(false);
		} catch {
			props.showAlert("Password update failed", "danger");
		}
	};

	/* ================= LOGOUT ================= */
	const handleLogoutAll = () => {
		if (!window.confirm("Are you sure you want to logout from all devices?")) return;

		localStorage.removeItem("token");
		localStorage.removeItem("name");
		props.showAlert("Logged out successfully", "success");
		navigate("/login");
	};

	/* ================= DELETE ACCOUNT ================= */
	const handleDeleteAccount = async () => {
		if (!window.confirm("This will permanently delete your account and all notes. Continue?")) return;

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
		} catch {
			props.showAlert("Delete failed", "danger");
		}
	};

	if (loading) return null;

	return (
		<div className="settings-layout">
			<motion.div className="settings-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
				{/* PROFILE HEADER */}
				<div className="settings-profile">
					<div className="settings-avatar" onClick={() => setShowAvatarPicker(true)}>
						{form.avatar ? <img src={`https://api.dicebear.com/7.x/${selectedStyle}/svg?seed=${selectedSeed}`} alt="avatar" className="settings-avatar-img" /> : <span className="settings-avatar-letter">{form.name ? form.name.charAt(0).toUpperCase() : "U"}</span>}
					</div>

					<h3>{form.name}</h3>
					<p>{form.email}</p>

					<p className="settings-joined">
						<i className="fa-solid fa-calendar"></i>
						Joined on {formatDate(form.joinedDate)}
					</p>
				</div>

				{/* AVATAR MODAL */}
				{showAvatarPicker && (
					<div className="avatar-modal">
						<div className="avatar-modal-content">
							<h4>Choose Your Avatar</h4>

							<div className="avatar-grid">
								{/* NONE OPTION */}
								<div className={`avatar-style-wrapper ${!selectedStyle ? "selected" : ""}`} onClick={() => handleAvatarSelect("", "")}>
									<div className="avatar-none-option">{form.name ? form.name.charAt(0).toUpperCase() : "U"}</div>
									<span className="avatar-style-name">Default</span>
								</div>

								{/* STYLES */}
								{avatarStyles.map((style, index) => {
									const isSelected = selectedStyle === style;

									return (
										<div key={index} className={`avatar-style-wrapper ${isSelected ? "selected" : ""}`} onClick={() => handleAvatarSelect(style, generateRandomSeed())}>
											<img src={`https://api.dicebear.com/7.x/${style}/svg?seed=test`} alt={style} className="avatar-option-img" />

											<span className="avatar-style-name">{style}</span>

											{isSelected && <div className="avatar-selected-badge">✓</div>}
										</div>
									);
								})}
							</div>

							<button className="settings-secondary-btn" onClick={() => setShowAvatarPicker(false)}>
								Cancel
							</button>
						</div>
					</div>
				)}

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

								<button className="settings-secondary-btn" type="button" onClick={() => setIsEditing(false)}>
									Cancel
								</button>
							</div>
						</form>
					)}
				</div>

				{/* SECURITY */}
				<div className="settings-section">
					<h4>Security</h4>

					{!showPasswordForm ? (
						<button className="settings-secondary-btn" onClick={() => setShowPasswordForm(true)}>
							Change Password
						</button>
					) : (
						<form onSubmit={handlePasswordUpdate} className="settings-form">
							<input type="password" name="password" placeholder="New Password" value={form.password} onChange={handleChange} />

							<input type="password" name="confirmPassword" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} />

							<div className="settings-actions">
								<button className="settings-primary-btn" type="submit">
									Update Password
								</button>

								<button type="button" className="settings-secondary-btn" onClick={() => setShowPasswordForm(false)}>
									Cancel
								</button>
							</div>
						</form>
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

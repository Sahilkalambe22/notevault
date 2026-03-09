import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LuFileLock2 } from "react-icons/lu";
import { motion } from "framer-motion";
import "./AuthLayout.css";

const Login = (props) => {
	const [credentials, setCredentials] = useState({
		email: "",
		password: "",
	});

	const navigate = useNavigate();
	const host = "http://localhost:5000";

	const handleSubmit = async (e) => {
		e.preventDefault();

		const response = await fetch(`${host}/api/auth/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(credentials),
		});

		const json = await response.json();

		if (json.success) {
			localStorage.setItem("token", json.authtoken);
			localStorage.setItem("name", json.name);
			navigate("/profile");
			props.showAlert("Logged in Successfully", "success");
		} else {
			props.showAlert(json.error || "Login failed", "warning");
		}
	};

	const onChange = (e) => {
		setCredentials({ ...credentials, [e.target.name]: e.target.value });
	};

	return (
		<div className="nv-auth-container reverse">
			{/* LEFT SIDE */}
			<motion.div className="nv-auth-left" initial={{ x: 150, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 1 }}>
				<div className="nv-brand-content">
					<h1 className="nv-logo">
						<LuFileLock2 className="nv-logo-icon" />
						NoteVault
					</h1>

					<div className="nv-brand-divider"></div>

					<p>Welcome back. Your secure notes await.</p>

					<ul className="nv-feature-list">
						<li>✔ End-to-End Security</li>
						<li>✔ Cloud Sync</li>
						<li>✔ Private & Encrypted</li>
					</ul>
				</div>
			</motion.div>

			{/* RIGHT SIDE */}
			<motion.div className="nv-auth-right">
				<div className="nv-auth-card">
					<h2 className="nv-auth-title">Login to your account</h2>

					<form onSubmit={handleSubmit}>
						<div className="nv-input-group">
							<input type="email" id="email" className="form-control" name="email" value={credentials.email} onChange={onChange} minLength={5} required placeholder=" " />
							<label htmlFor="email">Email Address</label>
						</div>

						<div className="nv-input-group">
							<input type="password" id="password" className="form-control" name="password" value={credentials.password} onChange={onChange} minLength={5} required placeholder=" " />
							<label htmlFor="password">Password</label>
						</div>

						<small className="nv-privacy-note">🔒 Your data is encrypted and secure.</small>

						<button type="submit" className="nv-auth-btn w-100 mt-3">
							Login
						</button>
					</form>

					<div className="nv-auth-footer">
						Don’t have an account? <Link to="/signup">Register</Link>
					</div>
					<p className="nv-auth-footer">
						<Link to="/forgot-password">Forgot Password?</Link>
					</p>
				</div>
			</motion.div>
		</div>
	);
};

export default Login;

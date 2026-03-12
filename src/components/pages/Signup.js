import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LuFileLock2 } from "react-icons/lu";
import { motion } from "framer-motion";
import "../AuthLayout.css";

const Signup = (props) => {
	const [credentials, setCredentials] = useState({
		name: "",
		email: "",
		password: "",
		cpassword: "",
	});

	const navigate = useNavigate();
	const host = "http://localhost:5000";

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (credentials.password !== credentials.cpassword) {
			props.showAlert("Passwords do not match", "warning");
			return;
		}

		const { name, email, password } = credentials;

		const response = await fetch(`${host}/api/auth/createuser`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name, email, password }),
		});

		const json = await response.json();

		if (json.success) {
			if (json.success) {
				navigate("/verify-otp", { state: { email: credentials.email } });
				props.showAlert("OTP sent to your email", "success");
			}
		} else {
			props.showAlert("Invalid credentials", "warning");
		}
	};

	const onChange = (e) => {
		setCredentials({ ...credentials, [e.target.name]: e.target.value });
	};

	return (
		<div className="nv-auth-container">
			{/* LEFT SIDE */}
			<motion.div className="nv-auth-left" initial={{ x: -150, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 1 }}>
				<div className="nv-brand-content">
					<h1 className="nv-logo">
						<LuFileLock2 className="nv-logo-icon" />
						NoteVault
					</h1>
					<div className="nv-brand-divider"></div>
					<p>Secure. Organize. Access Anywhere.</p>

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
					<h2 className="nv-auth-title">Create your account</h2>

					<form onSubmit={handleSubmit}>
						<div className="nv-input-group">
							<input type="text" className="form-control" name="name" value={credentials.name} onChange={onChange} minLength={5} required placeholder=" " />
							<label>Full Name</label>
						</div>

						<div className="nv-input-group">
							<input type="email" className="form-control" name="email" value={credentials.email} onChange={onChange} minLength={5} required placeholder=" " />
							<label>Email Address</label>
						</div>

						<div className="nv-input-group">
							<input type="password" className="form-control" name="password" value={credentials.password} onChange={onChange} minLength={5} required placeholder=" " />
							<label>Password</label>
						</div>

						<div className="nv-input-group">
							<input type="password" className="form-control" name="cpassword" value={credentials.cpassword} onChange={onChange} minLength={5} required placeholder=" " />
							<label>Confirm Password</label>
						</div>

						<button type="submit" className="nv-auth-btn w-100 mt-3">
							Create Account
						</button>
					</form>

					<div className="nv-auth-footer">
						Already have an account? <Link to="/login">Login</Link>
					</div>
				</div>
			</motion.div>
		</div>
	);
};

export default Signup;

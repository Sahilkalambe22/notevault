import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../AuthLayout";

const ForgotPassword = ({ showAlert }) => {
	const [email, setEmail] = useState("");
	const navigate = useNavigate();
	const host = "http://localhost:5000";

	const handleSubmit = async (e) => {
		e.preventDefault();

		const res = await fetch(`${host}/api/auth/forgot-password`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email }),
		});

		const json = await res.json();

		if (json.success) {
			showAlert("If email exists, OTP sent", "success");
			navigate("/reset-password", { state: { email } });
		} else {
			showAlert(json.error || "Error occurred", "danger");
		}
	};

	return (
		<AuthLayout mode="signup">
			<div className="nv-auth-card">
				<h2 className="nv-auth-title">Forgot Password</h2>

				<form onSubmit={handleSubmit}>
					<div className="nv-input-group">
						<input type="email" required placeholder=" " value={email} onChange={(e) => setEmail(e.target.value)} />
						<label>Email Address</label>
					</div>

					<button className="nv-auth-btn w-100">Send Reset OTP</button>
				</form>
			</div>
		</AuthLayout>
	);
};

export default ForgotPassword;

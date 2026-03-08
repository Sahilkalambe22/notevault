import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

const ResetPassword = ({ showAlert }) => {
	const location = useLocation();
	const navigate = useNavigate();
	const host = "http://localhost:5000";

	const email = location.state?.email;

	const [otp, setOtp] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (newPassword !== confirmPassword) {
			showAlert("Passwords do not match", "warning");
			return;
		}

		const res = await fetch(`${host}/api/auth/reset-password`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, otp, newPassword }),
		});

		const json = await res.json();

		if (json.success) {
			showAlert("Password reset successful", "success");
			navigate("/login");
		} else {
			showAlert(json.error || "Error occurred", "danger");
		}
	};

	return (
		<AuthLayout mode="signup">
			<div className="nv-auth-card">
				<h2 className="nv-auth-title">Reset Password</h2>

				<form onSubmit={handleSubmit}>
					<div className="nv-input-group">
						<input type="text" required placeholder=" " value={otp} onChange={(e) => setOtp(e.target.value)} />
						<label>Enter OTP</label>
					</div>

					<div className="nv-input-group">
						<input type="password" required placeholder=" " value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
						<label>New Password</label>
					</div>

					<div className="nv-input-group">
						<input type="password" required placeholder=" " value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
						<label>Confirm Password</label>
					</div>

					<button className="nv-auth-btn w-100 mt-3">Reset Password</button>
				</form>
			</div>
		</AuthLayout>
	);
};

export default ResetPassword;

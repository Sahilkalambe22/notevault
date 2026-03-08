import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

const VerifyOTP = ({ showAlert }) => {
	const [otp, setOtp] = useState("");
	const navigate = useNavigate();
	const location = useLocation();
	const host = "http://localhost:5000";

	const email = location.state?.email;

	const handleVerify = async (e) => {
		e.preventDefault();

		const res = await fetch(`${host}/api/auth/verify-otp`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, otp }),
		});

		const json = await res.json();

		if (json.success) {
			localStorage.setItem("token", json.authtoken);
			showAlert("Account Created Successfully", "success");
			navigate("/profile");
		} else {
			showAlert(json.error, "warning");
		}
	};

	return (
		<AuthLayout mode="signup">
			<div className="nv-auth-card">
				<h2 className="nv-auth-title">Enter OTP</h2>

				<form onSubmit={handleVerify}>
					<div className="nv-input-group">
						<input type="text" value={otp} placeholder=" " onChange={(e) => setOtp(e.target.value)} required />
						<label>Enter 6-digit OTP</label>
					</div>

					<button className="nv-auth-btn w-100">Verify & Create Account</button>
				</form>

				<div className="nv-auth-footer">
					Didn't receive OTP? <a href="/signup">Register Again</a>
				</div>
			</div>
		</AuthLayout>
	);
};

export default VerifyOTP;

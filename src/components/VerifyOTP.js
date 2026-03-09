import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

const VerifyOTP = ({ showAlert }) => {
	const [otp, setOtp] = useState("");

	const navigate = useNavigate();
	const location = useLocation();

	const host = "http://localhost:5000";

	const mode = location.state?.mode || "signup";
	const email = location.state?.email;

	const handleVerify = async (e) => {
		e.preventDefault();

		if (!/^\d{6}$/.test(otp)) {
			showAlert("Enter a valid 6-digit OTP", "warning");
			return;
		}

		let url = "";
		let body = {};

		if (mode === "signup") {
			if (!email) {
				showAlert("Signup session expired. Please register again.", "warning");
				navigate("/signup");
				return;
			}

			url = `${host}/api/auth/verify-otp`;
			body = { email, otp };
		}

		if (mode === "email-change") {
			url = `${host}/api/auth/verify-email-change`;
			body = { otp };
		}

		const res = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...(mode === "email-change" && {
					"auth-token": localStorage.getItem("token"),
				}),
			},
			body: JSON.stringify(body),
		});

		const json = await res.json();

		if (json.success) {
			if (mode === "signup") {
				localStorage.setItem("token", json.authtoken);
				showAlert("Account Created Successfully", "success");
				navigate("/profile");
			}

			if (mode === "email-change") {
				const newEmail = location.state?.newEmail;

				if (newEmail) {
					localStorage.setItem("email", newEmail);
				}

				showAlert("Email updated successfully", "success");
				navigate("/settings");
			}
		} else {
			showAlert(json.error || "Verification failed", "warning");
		}
	};

	return (
		<AuthLayout mode="signup">
			<div className="nv-auth-card">
				<h2 className="nv-auth-title">{mode === "signup" ? "Enter OTP" : "Verify Email Change"}</h2>

				<form onSubmit={handleVerify}>
					<div className="nv-input-group">
						<input type="text" value={otp} placeholder=" " maxLength={6} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} required />

						<label>Enter 6-digit OTP</label>
					</div>

					<button className="nv-auth-btn w-100">Verify</button>
				</form>

				<div className="nv-auth-footer">
					Didn't receive OTP? <a href="/signup">Register Again</a>
				</div>
			</div>
		</AuthLayout>
	);
};

export default VerifyOTP;

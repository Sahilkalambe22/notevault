import React, { useEffect, useState } from "react";
import "./PlanPage.css";

const host = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const PlanPage = () => {
	const [plan, setPlan] = useState("free");

	useEffect(() => {
		const fetchPlan = async () => {
			try {
				const res = await fetch(`${host}/api/notes/usage`, {
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				});

				const data = await res.json();

				setPlan(data.plan);
			} catch (err) {
				console.error("Failed to fetch plan", err);
			}
		};

		fetchPlan();
	}, []);

	return (
		<div className="plan-page">
			<h2 className="plan-title">Choose Your Plan</h2>
			<p className="plan-subtitle">Upgrade your NoteVault experience</p>

			<div className="plan-grid">
				{/* FREE PLAN */}

				<div className="plan-card">
					<h3>Free</h3>

					<div className="plan-price">
						$0 <span>/month</span>
					</div>

					<ul className="plan-features">
						<li>✔ 50 Notes</li>
						<li>✔ Attachments</li>
						<li>✔ Reminders</li>
						<li>✔ Version History</li>
						<li>✔ Public Sharing</li>
						<li className="limit-note">Limited usage</li>
					</ul>

					<button className="plan-btn secondary" disabled={plan === "free"}>
						{plan === "free" ? "Current Plan" : "Downgrade"}
					</button>
				</div>

				{/* PRO PLAN */}

				<div className="plan-card pro">
					<div className="plan-badge">Most Popular</div>

					<h3>Pro</h3>

					<div className="plan-price">
						$5 <span>/month</span>
					</div>

					<ul className="plan-features">
						<li>✔ Unlimited Notes</li>
						<li>✔ More Attachments</li>
						<li>✔ Priority Features</li>
						<li>✔ Faster Search</li>
						<li>✔ Future AI tools</li>
					</ul>

					<button className="plan-btn primary" disabled={plan === "pro"} onClick={() => alert("Payments coming soon")}>
						{plan === "pro" ? "Current Plan" : "Upgrade to Pro"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default PlanPage;

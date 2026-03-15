import React, { useEffect, useState } from "react";
import "./PlanPage.css";

const host = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

const PlanPage = () => {
	const [plan, setPlan] = useState("free");
	const [billing, setBilling] = useState("monthly");

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

	const isYearly = billing === "yearly";

	return (
		<div className="plan-page">
			<h2 className="plan-title">Choose Your Plan</h2>
			<p className="plan-subtitle">Upgrade your NoteVault experience</p>

			{/* BILLING TOGGLE */}
			<div className="billing-toggle">
				<button className={billing === "monthly" ? "active" : ""} onClick={() => setBilling("monthly")}>
					Monthly
				</button>

				<button className={billing === "yearly" ? "active" : ""} onClick={() => setBilling("yearly")}>
					Yearly <span className="save-tag">Save 17%</span>
				</button>
			</div>

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
						{plan === "free" ? "Current Plan" : "Switch to Free"}
					</button>
				</div>

				{/* PRO PLAN */}

				<div className="plan-card pro">
					<div className="plan-badge">Most Popular</div>

					<h3>Pro</h3>

					<div className="plan-price">
						{isYearly ? "$50" : "$5"} <span>{isYearly ? "/year" : "/month"}</span>
					</div>

					{isYearly && <div className="plan-save">Save 17%</div>}

					<ul className="plan-features">
						<li>✔ Everything in Free</li>
						<li>✔ Unlimited Notes</li>
						<li>✔ More Attachments</li>
						<li>✔ Priority Features</li>
						<li>✔ Faster Search</li>
						<li>✔ Future AI tools</li>
					</ul>

					<button className="plan-btn primary" disabled={plan === "pro"} onClick={() => alert("Payments coming soon")}>
						{plan === "pro" ? "Current Plan" : isYearly ? "Upgrade Yearly" : "Upgrade to Pro"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default PlanPage;

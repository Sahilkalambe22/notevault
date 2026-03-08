import React from "react";
import { Link } from "react-router-dom";
import NoteItem from "./NoteItem";
import "./Home.css";

const Home = () => {
	const isLoggedIn = localStorage.getItem("token");

	const demoNotes = [
		{
			_id: "demo1",
			title: "Morning Routine",
			description: "<p>Water, workout. Everything starts with a good morning!</p>",
			tag: "Personal",
			isPinned: false,
		},
		{
			_id: "demo2",
			title: "Project Ideas",
			description: "<p>Notebook v2, team dashboard, client tasks.</p>",
			tag: "Work",
			isPinned: true,
		},
		{
			_id: "demo3",
			title: "Skills to Learn",
			description: "<p>React hooks, Node.js, system design basics.</p>",
			tag: "Todo",
			isPinned: false,
		},
		{
			_id: "demo4",
			title: "Client Meeting",
			description: "<p>Discussing project scope and timeline.</p>",
			tag: "Important",
			isPinned: false,
		},
	];

	return (
		<div className="container-home mt-5">
			{/* Hero Section */}
			<div className="hero-section text-center">
				<h1 className="display-4 fw-bold">Welcome to NoteVault</h1>
				<p className="hero-subtext">Your secure digital space to store notes, images, ideas, attachments, and everything that matters — accessible anywhere.</p>

				{/* Login → Notes button */}
				<Link to={isLoggedIn ? "/profile" : "/login"} className="btn btn-primary btn-lg mt-3">
					{isLoggedIn ? "Jump back into your notes" : "Get Started"}
				</Link>
			</div>

			<div className="section-divider"></div>

			{/* ================= FEATURES SECTION ================= */}

			<section className="features-section">
				<div className="features-container text-center">
					<h2 className="fw-bold mb-3">Why Use NoteVault?</h2>

					<p className="features-subtext">Everything you need to organize, protect, and manage your digital thoughts — all in one place.</p>

					<div className="features-grid">
						<div className="feature-card">
							<div className="feature-icon">
								<i className="fa-solid fa-shield-halved"></i>
							</div>
							<h4>Secure Notes</h4>
							<p>Your notes, images, and attachments are encrypted and accessible only to you.</p>
						</div>

						<div className="feature-card">
							<div className="feature-icon">
								<i className="fa-solid fa-bolt"></i>
							</div>
							<h4>Fast & Simple</h4>
							<p>A distraction-free interface designed for speed and productivity.</p>
						</div>

						<div className="feature-card">
							<div className="feature-icon">
								<i className="fa-solid fa-paperclip"></i>
							</div>
							<h4>Attach Anything</h4>
							<p>Add images, PDFs, and documents directly to your notes.</p>
						</div>

						<div className="feature-card">
							<div className="feature-icon">
								<i className="fa-solid fa-tags"></i>
							</div>
							<h4>Custom Tags</h4>
							<p>Organize notes using flexible tags like work, personal, or priority.</p>
						</div>

						<div className="feature-card">
							<div className="feature-icon">
								<i className="fa-solid fa-bell"></i>
							</div>
							<h4>Reminders</h4>
							<p>Set reminders so you never miss important tasks or follow-ups.</p>
						</div>

						<div className="feature-card">
							<div className="feature-icon">
								<i className="fa-solid fa-clock-rotate-left"></i>
							</div>
							<h4>Version History</h4>
							<p>Track changes automatically and restore previous versions anytime.</p>
						</div>
					</div>
				</div>
			</section>

			<div className="section-divider"></div>

			{/* ========================How It Works Section==================== */}
			<div className="how-section text-center">
				<h2 className="fw-bold mb-5">How It Works</h2>

				<div className="row justify-content-center">
					<div className="col-md-3 col-sm-6 mb-4">
						<div className="how-step">
							<div className="step-number">1</div>
							<h5>Create Notes</h5>
							<p>Write rich text notes, attach files, and organize with tags.</p>
						</div>
					</div>

					<div className="col-md-3 col-sm-6 mb-4">
						<div className="how-step">
							<div className="step-number">2</div>
							<h5>Stay Organized</h5>
							<p>Filter by tags, set reminders, and track version history.</p>
						</div>
					</div>

					<div className="col-md-3 col-sm-6 mb-4">
						<div className="how-step">
							<div className="step-number">3</div>
							<h5>Access Anywhere</h5>
							<p>Securely access your notes anytime from any device.</p>
						</div>
					</div>
				</div>
			</div>
			<div className="section-divider"></div>

			{/* Live Demo Notes Section */}
			<div className="demo-notes-section">
				<h2 className="fw-bold text-center mb-4">See NoteVault in Action</h2>
				<p className="text-center mb-4">A preview of how your notes will look inside the notebook.</p>

				<div className="row demo-row">
					{demoNotes.map((note) => (
						<NoteItem key={note._id} note={note} updateNote={() => {}} showAlert={() => {}} />
					))}
				</div>
			</div>
			<div className="section-divider"></div>

			{/* =================CTA SECTION ================= */}

			<section className="cta">
				<div className="cta-card">
					<h2 className="cta-title">Ready to organize your life?</h2>

					<p className="cta-text">{isLoggedIn ? "Open your notebook and continue where you left off." : "Create an account and start taking notes instantly."}</p>

					<Link to={isLoggedIn ? "/profile" : "/signup"} className="btn btn-primary final-cta-btn">
						{isLoggedIn ? "Go to Your Notebook" : "Create Free Account"}
					</Link>
				</div>
			</section>

			<div className="section-divider"></div>
		</div>
	);
};

export default Home;

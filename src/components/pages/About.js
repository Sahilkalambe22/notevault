import React from "react";
import { Link } from "react-router-dom";
import "./About.css";
import "./Home.css";

const About = () => {
	const isLoggedIn = localStorage.getItem("token");

	return (
		<div className="container-home mt-5">
			{/* ================= HERO ================= */}

			<div className="hero-section text-center">
				<h1 className="display-4 fw-bold">About NoteVault</h1>

				<p className="hero-subtext">NoteVault is a modern digital notebook designed to help you store, organize, and protect your ideas, notes, files, and reminders — all in one secure place.</p>
			</div>

			<div className="section-divider"></div>

			{/* ================= STORY ================= */}

			<section className="about-story text-center">
				<h2 className="fw-bold mb-4">Our Mission</h2>

				<p className="about-text">In a world full of scattered information, keeping your thoughts organized should be simple. NoteVault was created to provide a distraction-free environment where users can capture ideas, manage knowledge, and store important information securely.</p>

				<p className="about-text">Whether it is personal notes, work plans, study materials, or creative ideas — NoteVault keeps everything in one place, accessible anytime from anywhere.</p>
			</section>

			<div className="section-divider"></div>

			{/* ================= CORE FEATURES ================= */}

			<section className="features-section">
				<div className="features-container text-center">
					<h2 className="fw-bold mb-3">Core Principles</h2>

					<p className="features-subtext">NoteVault is designed around simplicity, security, and productivity.</p>

					<div className="features-grid">
						<div className="feature-card">
							<div className="feature-icon">
								<i className="fa-solid fa-shield-halved"></i>
							</div>

							<h4>Privacy First</h4>

							<p>Your notes and files belong only to you.</p>
						</div>

						<div className="feature-card">
							<div className="feature-icon">
								<i className="fa-solid fa-bolt"></i>
							</div>

							<h4>Fast Workflow</h4>

							<p>Quickly capture ideas without distractions.</p>
						</div>

						<div className="feature-card">
							<div className="feature-icon">
								<i className="fa-solid fa-folder-tree"></i>
							</div>

							<h4>Organized Knowledge</h4>

							<p>Tags, reminders, and version history keep everything structured.</p>
						</div>
					</div>
				</div>
			</section>

			<div className="section-divider"></div>

			{/* ================= TECHNOLOGY ================= */}

			<section className="tech-section text-center">
				<h2 className="fw-bold mb-4">Technology Behind NoteVault</h2>

				<div className="tech-grid">
					<div className="tech-card">
						<h5>Frontend</h5>
						<p>React.js</p>
					</div>

					<div className="tech-card">
						<h5>Backend</h5>
						<p>Node.js & Express</p>
					</div>

					<div className="tech-card">
						<h5>Database</h5>
						<p>MongoDB</p>
					</div>

					<div className="tech-card">
						<h5>Security</h5>
						<p>JWT Authentication</p>
					</div>
				</div>
			</section>

			<div className="section-divider"></div>

			{/* ================= DEVELOPER ================= */}

			<section className="developer-section text-center">
				<h2 className="fw-bold mb-4">Developer</h2>

				<div className="developer-card">
					<h4>Sahil Kalambe</h4>

					<p>Software developer passionate about building clean, efficient, and user-focused applications.</p>
				</div>
			</section>

			<div className="section-divider"></div>

			{/* ================= CTA ================= */}

			<section className="cta">
				<div className="cta-card">
					<h2 className="cta-title">Start organizing your ideas today</h2>

					<p className="cta-text">{isLoggedIn ? "Continue writing and organizing your notes." : "Create an account and start building your digital notebook."}</p>

					<Link to={isLoggedIn ? "/profile" : "/signup"} className="btn btn-primary final-cta-btn">
						{isLoggedIn ? "Open Notebook" : "Create Free Account"}
					</Link>
				</div>
			</section>

			<div className="section-divider"></div>
		</div>
	);
};

export default About;

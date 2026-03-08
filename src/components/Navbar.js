import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
	const navigate = useNavigate();
	const location = useLocation();
	const isLoggedIn = localStorage.getItem("token");

	const toggleTheme = () => {
		const newTheme = !isLight;

		setIsLight(newTheme);

		if (newTheme) {
			document.documentElement.classList.add("light-mode");
			localStorage.setItem("theme", "light");
		} else {
			document.documentElement.classList.remove("light-mode");
			localStorage.setItem("theme", "dark");
		}
	};

	const [isLight, setIsLight] = useState(false);

	useEffect(() => {
		const savedTheme = localStorage.getItem("theme");
		if (savedTheme === "light") {
			document.documentElement.classList.add("light-mode");
			setIsLight(true);
		}
	}, []);

	const handleLogout = () => {
		localStorage.removeItem("token");
		navigate("/login");
	};

	return (
		<nav className="navbar navbar-expand-lg nv-navbar">
			<div className="container">
				<Link className="navbar-brand nv-name" to="/">
					NoteVault
				</Link>

				{/* Bootstrap Toggle */}
				<button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar">
					<span className="navbar-toggler-icon"></span>
				</button>

				<div className="collapse navbar-collapse justify-content-end" id="mainNavbar">
					<ul className="navbar-nav align-items-lg-center gap-lg-4">
						<li className="nav-item d-flex align-items-center">
							<div className="form-check form-switch m-0">
								<input className="form-check-input" type="checkbox" role="switch" id="themeSwitch" checked={isLight} onChange={toggleTheme} />

								<label className="form-check-label ms-2 nv-link" htmlFor="themeSwitch" style={{ cursor: "pointer" }}>
									{isLight ? "Light" : "Dark"}
								</label>
							</div>
						</li>

						<li className="nav-item">
							<Link to="/" className={`nav-link nv-link ${location.pathname === "/" ? "active" : ""}`}>
								Home
							</Link>
						</li>

						{isLoggedIn && (
							<li className="nav-item">
								<Link to="/profile" className={`nav-link nv-link ${location.pathname === "/profile" ? "active" : ""}`}>
									Profile
								</Link>
							</li>
						)}

						{!isLoggedIn ? (
							<>
								<li className="nav-item">
									<Link className="nav-link nv-link" to="/login">
										Login
									</Link>
								</li>

								<li className="nav-item">
									<Link className="nav-link nv-link" to="/signup">
										Sign-Up
									</Link>
								</li>
							</>
						) : (
							<li className="nav-item dropdown">
								<i className="fa-solid fa-id-card nv-profile-icon" data-bs-toggle="dropdown"></i>

								<ul className="dropdown-menu dropdown-menu-end nv-dropdown">
									<li>
										<Link className="dropdown-item" to="/settings">
											Settings
										</Link>
									</li>
									<li>
										<hr className="dropdown-divider" />
									</li>
									<li>
										<button className="dropdown-item text-danger" onClick={handleLogout}>
											Logout
										</button>
									</li>
								</ul>
							</li>
						)}
					</ul>
				</div>
			</div>
		</nav>
	);
}

export default Navbar;

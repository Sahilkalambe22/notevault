import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
	let navigate = useNavigate();
	const handleLogout = () => {
		localStorage.removeItem("token");
		navigate("/login");
	};
	return (
		<div>
			<nav className="navbar fixed-top navbar-expand-lg navbar-dark bg-dark">
				<div className="container-fluid">
					<Link className="navbar-brand" to="/">
						Notevault
					</Link>
					<button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
						<span className="navbar-toggler-icon"></span>
					</button>
					<div className="collapse navbar-collapse" id="navbarSupportedContent">
						<ul className="navbar-nav me-auto mb-2 mb-lg-0">
							<li className="nav-item">
								<Link className="nav-link" aria-current="page" to="/">
									Home
								</Link>
							</li>
							{/*<li className="nav-item">
								<Link className="nav-link" to="/about">
									About us
								</Link>
							</li>*/}
							<li className="nav-item">
								<Link className="nav-link" to="/profile">
									Your Profile
								</Link>
							</li>
						</ul>

						<div className="d-flex">
							{!localStorage.getItem("token") ? (
								<div className="container">
									<Link className="btn btn-light mx-2" to="/login" role="button">
										Login
									</Link>
									<Link className="btn btn-light mx-2" to="/signup" role="button">
										Signup
									</Link>
								</div>
							) : (
								<>
									<div className="dropdown">
										<i className="fa-solid fa-id-card" style={{ color: "#ffffff", cursor: "pointer", fontSize: "20px" }} data-bs-toggle="dropdown" aria-expanded="false"></i>

										<ul className="dropdown-menu dropdown-menu-end">
											<li>
												<Link className="dropdown-item" to="/profile">
													Your Profile
												</Link>
											</li>

											<li>
												<Link className="dropdown-item" to="/settings">
													Settings
												</Link>
											</li>

											<li>
												<hr className="dropdown-divider" />
											</li>

											<li>
												<button className="btn btn-primary mx-2" style={{ backgroundColor: "rgb(15, 12, 50)", color: "white" }} onClick={handleLogout}>
													Logout
												</button>
											</li>
										</ul>
									</div>
								</>
							)}
						</div>
					</div>
				</div>
			</nav>
		</div>
	);
}

export default Navbar;

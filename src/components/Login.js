import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = (props) => {
	const [credentials, setcredentials] = useState({ email: "", password: "" });
	let navigate = useNavigate();
	const host = "http://localhost:5000";

	const handleSubmit = async (e) => {
		e.preventDefault();
		const response = await fetch(`${host}/api/auth/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email: credentials.email, password: credentials.password }),
		});

		const json = await response.json();
		console.log(json);

		if (json.success) {
			localStorage.setItem("token", json.authtoken);
			localStorage.setItem("name", json.name);
			navigate("/profile");
			props.showAlert("Logged in Successfully", "success");
		} else {
			props.showAlert("Invalid credentials", "warning");
		}
	};

	const onChange = (e) => {
		setcredentials({ ...credentials, [e.target.name]: e.target.value });
	};

	return (
		<div className="d-flex justify-content-center mt-5">
			<div className="card p-4 col-md-4" style={{ backgroundColor: "#f3ebc3ff", borderRadius: "12px" }}>
				<h2 className="mb-4 text-center fw-bold">iNotebook is Waiting</h2>

				<form onSubmit={handleSubmit}>
					<div className="mb-3">
						<input type="email" className="form-control border-0 border-bottom rounded-0 px-1" id="email" name="email" placeholder="Email address" style={{ backgroundColor: "#f3ebc3ff" }} value={credentials.email} onChange={onChange} minLength={5} required />
					</div>

					<div className="mb-3">
						<input type="password" className="form-control border-0 border-bottom rounded-0 px-1" id="password" name="password" placeholder="Password" style={{ backgroundColor: "#f3ebc3ff" }} value={credentials.password} onChange={onChange} minLength={5} required />
					</div>

					<button type="submit" className="btn w-100 mt-2" style={{ backgroundColor: "rgb(15, 12, 50)", color: "white" }}>
						Submit
					</button>
				</form>

				<div className="text-center mt-3">
					<Link to="/signup" style={{ textDecoration: "none", color: "rgb(15, 12, 50)" }}>
						<h5>Don't have an account? Register</h5>
					</Link>
				</div>
			</div>
		</div>
	);
};

export default Login;

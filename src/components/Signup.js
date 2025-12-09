import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Signup = (props) => {
	const [credentials, setcredentials] = useState({ name: "", email: "", password: "", cpassword: "" });
	let navigate = useNavigate();

	const host = "http://localhost:5000";

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (credentials.password !== credentials.cpassword) {
			props.showAlert("Passwords do not match", "warning");
			return;
		}

		const { name, email, password } = credentials;

		const response = await fetch(`${host}/api/auth/createuser`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name, email, password }),
		});

		const json = await response.json();
		console.log(json);

		if (json.success) {
			localStorage.setItem("token", json.authtoken);
			navigate("/profile");
			props.showAlert("Signup Successful", "success");
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
				<h2 className="mb-4 text-center fw-bold">Create your iNotebook account</h2>

				<form onSubmit={handleSubmit}>
					<div className="mb-3">
						<input type="text" className="form-control border-0 border-bottom rounded-0 px-1" id="name" name="name" placeholder="Name" value={credentials.name} onChange={onChange} minLength={5} required style={{ backgroundColor: "#f3ebc3ff" }} />
					</div>

					<div className="mb-3">
						<input type="email" className="form-control border-0 border-bottom rounded-0 px-1" id="email" name="email" placeholder="Email address" value={credentials.email} onChange={onChange} minLength={5} required style={{ backgroundColor: "#f3ebc3ff" }} />
					</div>

					<div className="mb-3">
						<input type="password" className="form-control border-0 border-bottom rounded-0 px-1" id="password" name="password" placeholder="Password" value={credentials.password} onChange={onChange} minLength={5} required style={{ backgroundColor: "#f3ebc3ff" }} />
					</div>

					<div className="mb-3">
						<input
							type="password"
							className="form-control border-0 border-bottom rounded-0 px-1"
							id="cpassword"
							name="cpassword"
							placeholder="Confirm Password"
							value={credentials.cpassword}
							onChange={onChange}
							minLength={5}
							required
							onInput={(e) => {
								e.target.setCustomValidity("");
								e.target.setCustomValidity(e.target.value !== document.getElementById("password").value ? "Passwords do not match" : "");
							}}
							style={{ backgroundColor: "#f3ebc3ff" }}
						/>
					</div>

					<button type="submit" className="btn w-100 mt-2" style={{ backgroundColor: "rgb(15, 12, 50)", color: "white" }}>
						Submit
					</button>
				</form>

				<div className="text-center mt-3">
					<Link to="/login" style={{ textDecoration: "none", color: "rgb(15, 12, 50)" }}>
						<h5>Already have an account? Login</h5>
					</Link>
				</div>
			</div>
		</div>
	);
};

export default Signup;

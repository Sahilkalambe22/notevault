import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./App.css";

import { Suspense, lazy, useState, useContext, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Spinner from "./components/loaders/Spinner";

import Navbar from "./components/Navbar";
import Alert from "./components/Alert";
import Footer from "./components/Footer";
import NotesState from "./context/notes/NotesSt";
import noteContext from "./context/notes/notesContext";
import ReminderManager from "./components/ReminderManager";
import ProtectedRoute from "./components/ProtectedRoute";

/* ---------- Lazy Loaded Pages ---------- */

const Home = lazy(() => import("./components/pages/Home"));
const About = lazy(() => import("./components/pages/About"));
const Login = lazy(() => import("./components/pages/Login"));
const Signup = lazy(() => import("./components/pages/Signup"));
const Profile = lazy(() => import("./components/pages/Profile"));
const ShowNote = lazy(() => import("./components/pages/ShowNote"));
const Settings = lazy(() => import("./components/pages/Settings"));
const VerifyOTP = lazy(() => import("./components/pages/VerifyOTP"));
const ForgotPassword = lazy(() => import("./components/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./components/pages/ResetPassword"));
const SharedNote = lazy(() => import("./components/pages/SharedNote"));
const PlanPage = lazy(() => import("./components/pages/PlanPage"));

/* ---------- Reminder Bridge ---------- */

function ReminderBridge({ showAlert }) {
	const { notes, updateReminder } = useContext(noteContext);

	return <ReminderManager notes={notes} showAlert={showAlert} updateReminder={updateReminder} />;
}

/* ---------- Layout Wrapper ---------- */

function AppContent({ showAlert }) {
	const location = useLocation();
	const isEditorPage = location.pathname.startsWith("/note/");

	useEffect(() => {
		const savedTheme = localStorage.getItem("theme");

		if (savedTheme === "light") {
			document.documentElement.classList.add("light-mode");
		} else {
			document.documentElement.classList.remove("light-mode");
		}
	}, []);

	return (
		<>
			<Navbar />
			<Alert alert={showAlert.alert} />

			<div className="app-content">
				{/* Spinner shown while lazy pages load */}
				<Suspense fallback={<Spinner text="Loading your workspace..." />}>
					{isEditorPage ? (
						/* ---------- Editor Route ---------- */

						<Routes>
							<Route
								path="/note/:id"
								element={
									<ProtectedRoute>
										<ShowNote showAlert={showAlert.fn} />
									</ProtectedRoute>
								}
							/>
						</Routes>
					) : (
						<div>
							{/* ---------- Normal Pages ---------- */}

							<Routes>
								<Route path="/" element={<Home showAlert={showAlert.fn} />} />

								<Route
									path="/profile"
									element={
										<ProtectedRoute>
											<Profile showAlert={showAlert.fn} />
										</ProtectedRoute>
									}
								/>

								<Route
									path="/settings"
									element={
										<ProtectedRoute>
											<Settings showAlert={showAlert.fn} />
										</ProtectedRoute>
									}
								/>

								<Route path="/about" element={<About />} />

								<Route path="/plans" element={<PlanPage />} />

								<Route path="/login" element={<Login showAlert={showAlert.fn} />} />

								<Route path="/signup" element={<Signup showAlert={showAlert.fn} />} />

								<Route path="/verify-otp" element={<VerifyOTP showAlert={showAlert.fn} />} />

								<Route path="/forgot-password" element={<ForgotPassword showAlert={showAlert.fn} />} />

								<Route path="/reset-password" element={<ResetPassword showAlert={showAlert.fn} />} />

								<Route path="/share/:id" element={<SharedNote />} />
							</Routes>

							<Footer />
						</div>
					)}
				</Suspense>
			</div>
		</>
	);
}

/* ---------- App ---------- */

function App() {
	const [alert, setAlert] = useState(null);

	const showAlert = (message, type) => {
		setAlert({ msg: message, type });

		setTimeout(() => setAlert(null), 2000);
	};

	return (
		<NotesState>
			<Router>
				{/* Global reminder engine */}
				<ReminderBridge showAlert={showAlert} />

				<AppContent showAlert={{ fn: showAlert, alert }} />
			</Router>
		</NotesState>
	);
}

export default App;

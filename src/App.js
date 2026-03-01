import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./App.css";

import { useState, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./components/Home";
// import About from "./components/About";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Profile from "./components/Profile";
import ShowNote from "./components/ShowNote";
import Settings from "./components/Settings";
import Alert from "./components/Alert";

import NotesState from "./context/notes/NotesSt";
import noteContext from "./context/notes/notesContext";
import ReminderManager from "./components/ReminderManager";
import ProtectedRoute from "./components/ProtectedRoute";

/* ---------- Reminder Bridge ---------- */
/* Connects ReminderManager to NotesState */
function ReminderBridge({ showAlert }) {
	const { notes, updateReminder } = useContext(noteContext);
	return <ReminderManager notes={notes} showAlert={showAlert} updateReminder={updateReminder} />;
}

/* ---------- Layout Wrapper ---------- */
function AppContent({ showAlert }) {
	const location = useLocation();
	const isEditorPage = location.pathname.startsWith("/note/");

	return (
		<>
			<Navbar />
			<Alert alert={showAlert.alert} />
			<div className="app-content">
				{isEditorPage ? (
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
					<div className="container">
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
							<Route path="/login" element={<Login showAlert={showAlert.fn} />} />
							<Route path="/signup" element={<Signup showAlert={showAlert.fn} />} />
						</Routes>
					</div>
				)}
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
				{/* 🔔 GLOBAL REMINDER ENGINE */}
				<ReminderBridge showAlert={showAlert} />

				<AppContent showAlert={{ fn: showAlert, alert }} />
			</Router>
		</NotesState>
	);
}

export default App;

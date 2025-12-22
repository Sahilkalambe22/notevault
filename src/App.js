import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import { useState, useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./components/Home";
import About from "./components/About";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Profile from "./components/Profile";
import ShowNote from "./components/ShowNote";
import UserHeader from "./components/UserHeader";
import Settings from "./components/Settings";
import Alert from "./components/Alert";

import NotesState from "./context/notes/NotesSt";
import noteContext from "./context/notes/notesContext";
import ReminderManager from "./components/ReminderManager";

/* ---------- GLOBAL STYLES ---------- */
document.body.style.backgroundColor = "rgb(15, 12, 50)";
document.body.style.color = "white";

/* ---------- Reminder Bridge ---------- */
/* Connects ReminderManager to NotesState */
function ReminderBridge({ showAlert }) {
  const { notes } = useContext(noteContext);
  return <ReminderManager notes={notes} showAlert={showAlert} />;
}

/* ---------- Layout Wrapper ---------- */
function AppContent({ showAlert }) {
  const location = useLocation();
  const isEditorPage = location.pathname.startsWith("/note/");

  return (
    <>
      <Navbar />
      <Alert alert={showAlert.alert} />
      <UserHeader />

      <div className="app-content">
        {isEditorPage ? (
          <Routes>
            <Route
              path="/note/:id"
              element={<ShowNote showAlert={showAlert.fn} />}
            />
          </Routes>
        ) : (
          <div className="container">
            <Routes>
              <Route path="/" element={<Home showAlert={showAlert.fn} />} />
              <Route
                path="/profile"
                element={<Profile showAlert={showAlert.fn} />}
              />
              <Route path="/about" element={<About />} />
              <Route
                path="/settings"
                element={<Settings showAlert={showAlert.fn} />}
              />
              <Route
                path="/login"
                element={<Login showAlert={showAlert.fn} />}
              />
              <Route
                path="/signup"
                element={<Signup showAlert={showAlert.fn} />}
              />
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

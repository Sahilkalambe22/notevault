import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';
import NotesState from './context/notes/NotesSt';
import NoteEditorPage from "./components/NoteEditorPage";
import Alert from './components/Alert';
import Login from './components/Login';
import Signup from './components/Signup';
import Profile from './components/Profile';

document.body.style.backgroundColor = "rgb(15, 12, 50)";
document.body.style.color = "white";

/* ---------------- Layout Wrapper ---------------- */

function AppContent({ showAlert }) {
  const location = useLocation();

  // Detect editor route
  const isEditorPage = location.pathname.startsWith("/note/");

  return (
    <>
      <Navbar />
      <Alert alert={showAlert.alert} />

      {isEditorPage ? (
        // ✅ NO container for editor
        <Routes>
          <Route path="/note/:id" element={<NoteEditorPage showAlert={showAlert.fn} />} />
        </Routes>
      ) : (
        // ✅ container for normal pages
        <div className="container">
          <Routes>
            <Route exact path="/" element={<Home showAlert={showAlert.fn} />} />
            <Route exact path="/profile" element={<Profile showAlert={showAlert.fn} />} />
            <Route exact path="/about" element={<About />} />
            <Route exact path="/login" element={<Login showAlert={showAlert.fn} />} />
            <Route exact path="/signup" element={<Signup showAlert={showAlert.fn} />} />
          </Routes>
        </div>
      )}
    </>
  );
}

/* ---------------- App ---------------- */

function App() {
  const [alert, setalert] = useState(null);

  const showAlert = (message, type) => {
    setalert({ msg: message, type });
    setTimeout(() => setalert(null), 2000);
  };

  return (
    <NotesState>
      <Router>
        <AppContent showAlert={{ fn: showAlert, alert }} />
      </Router>
    </NotesState>
  );
}

export default App;

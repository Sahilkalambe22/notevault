import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useState } from 'react';

import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';
import NotesState from './context/notes/NotesSt';
import  Alert from './components/Alert';
import Login from './components/Login';
import Signup from './components/Signup';
import Profile from './components/Profile';


document.body.style.backgroundColor = "rgb(15, 12, 50)";
document.body.style.color = "white";

function App() {

  const [alert, setalert] = useState(null);
  

  const showAlert = (massage,type)=> {
    setalert({
      msg: massage,
      type: type
    })
    setTimeout(() => {
      setalert(null);
    }, 2000);
  }

  return (
    <>
    <NotesState>
    <Router>
        <Navbar/>
        <Alert alert={alert} />
        <div className="container">
        <Routes>
            <Route exact path="/" element={<Home showAlert={showAlert} />} />
            <Route exact path="/profile" element={<Profile showAlert={showAlert} />} />
            <Route exact path="/about" element={<About />} />
            <Route exact path="/login" element={<Login showAlert={showAlert} />} />
            <Route exact path="/signup" element={<Signup showAlert={showAlert} />} />

        </Routes>
        </div>
        </Router>
        </NotesState>
      
    </>
  );
}

export default App;

 
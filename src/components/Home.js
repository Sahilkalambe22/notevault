import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  const isLoggedIn = localStorage.getItem("token");

  return (
    <div className="container mt-5">

      {/* Hero Section */}
      <div className="text-center py-5">
        <h1 className="display-4 fw-bold">Welcome to iNotebook</h1>
        <p className="lead mt-3">
          Your secure digital space to store notes, images, ideas, attachments,
          and everything that matters — accessible anywhere.
        </p>

        {/* Login → Notes button */}
        <Link
          to={isLoggedIn ? "/profile" : "/login"}
          className="btn btn-primary btn-lg mt-3"
          style={{ backgroundColor: "#f3ebc3ff", color: "black" }}
        >
          {isLoggedIn ? "Jump back into your notes" : "Get Started"}
        </Link>
      </div>

      <hr className="my-5" />

      {/* Features Section */}
      <div className="text-center">
        <h2 className="fw-bold mb-4">Why Use iNotebook?</h2>

        <div className="row d-flex justify-content-center">

          {/* Feature 1 */}
          <div className="col-md-3 col-sm-6 mb-4">
            <div className="card shadow-sm p-3" style={{ backgroundColor: "#f3ebc3ff" }}>
              <h4>🔒 Secure Notes</h4>
              <p className="text-muted">
                Your notes, images, and attachments are stored safely.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="col-md-3 col-sm-6 mb-4">
            <div className="card shadow-sm p-3" style={{ backgroundColor: "#f3ebc3ff" }}>
              <h4>⚡ Fast & Simple</h4>
              <p className="text-muted">
                Focused UI designed for fast note-taking.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="col-md-3 col-sm-6 mb-4">
            <div className="card shadow-sm p-3" style={{ backgroundColor: "#f3ebc3ff" }}>
              <h4><i class="fa-solid fa-link"></i> Attach Anything</h4>
              <p className="text-muted">
                Add images, documents, PDFs and keep everything organized.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Live Demo Notes Section */}
      <div className="mt-5">
        <h2 className="fw-bold text-center mb-4">See iNotebook in Action</h2>
        <p className="text-center text-muted mb-4">
          A preview of how your notes will look inside the notebook.
        </p>

        <div className="row">

          {/* Demo Note 1 */}
          <div className="col-md-3 mb-3">
            <div className="card shadow-sm h-100" style={{ backgroundColor: "#f3ebc3ff" }}>
              <div className="card-body">
                <small className="badge text-bg-secondary">personal</small>
                <h5 className="card-title mt-2">Morning Routine</h5>
                <p className="card-text">
                  Water, workout, planning the day.
                </p>
                <i className="fa-solid fa-user-pen mx-2"></i>
                <i className="fa-solid fa-trash-can mx-2"></i>
              </div>
            </div>
          </div>

          {/* Demo Note 2 */}
          <div className="col-md-3 mb-3">
            <div className="card shadow-sm h-100" style={{ backgroundColor: "#f3ebc3ff" }}>
              <div className="card-body">
                <small className="badge text-bg-secondary">work</small>
                <h5 className="card-title mt-2">Project Ideas</h5>
                <p className="card-text">
                  Notebook v2, team dashboard, client tasks.
                </p>
                <i className="fa-solid fa-user-pen mx-2"></i>
                <i className="fa-solid fa-trash-can mx-2"></i>
              </div>
            </div>
          </div>

          {/* Demo Note 3 */}
          <div className="col-md-3 mb-3">
            <div className="card shadow-sm h-100" style={{ backgroundColor: "#f3ebc3ff" }}>
              <div className="card-body">
                <small className="badge text-bg-secondary">learning</small>
                <h5 className="card-title mt-2">Skills to Learn</h5>
                <p className="card-text">
                  React hooks, Node.js, system design basics.
                </p>
                <i className="fa-solid fa-user-pen mx-2"></i>
                <i className="fa-solid fa-trash-can mx-2"></i>
              </div>
            </div>
          </div>

          {/* Demo Note 4 */}
          <div className="col-md-3 mb-3">
            <div className="card shadow-sm h-100" style={{ backgroundColor: "#f3ebc3ff" }}>
              <div className="card-body">
                <small className="badge text-bg-secondary">private</small>
                <h5 className="card-title mt-2">Client Meeting</h5>
                <p className="card-text">
                  Discussing project scope and timeline.
                </p>
                <i className="fa-solid fa-user-pen mx-2"></i>
                <i className="fa-solid fa-trash-can mx-2"></i>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Call-To-Action */}
      <div className="mt-5">
        <div
          className="p-4 rounded-3 text-center"
          style={{ backgroundColor: "#f3ebc3ff", color: "black" }}
        >
          <h3 className="mb-2">Ready to organize your life?</h3>
          <p className="mb-3">
            {isLoggedIn
              ? "Open your notebook and continue where you left off."
              : "Create an account and start taking notes instantly."}
          </p>

          <Link
            to={isLoggedIn ? "/profile" : "/signup"}
            className="btn btn-light btn-lg"
            style={{ backgroundColor: "rgb(15, 12, 50)", color: "white" }}
          >
            {isLoggedIn ? "Go to Your Notebook" : "Create Free Account"}
          </Link>
        </div>
      </div>

    </div>
  );
};

export default Home;

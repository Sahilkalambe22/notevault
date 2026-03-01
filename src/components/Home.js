import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  const isLoggedIn = localStorage.getItem("token");

  return (
    <div className="container-home mt-5">

      {/* Hero Section */}
      <div className="hero-section text-center">
        <h1 className="display-4 fw-bold">Welcome to NoteVault</h1>
        <p className="hero-subtext">
          Your secure digital space to store notes, images, ideas, attachments,
          and everything that matters — accessible anywhere.
        </p>

        {/* Login → Notes button */}
        <Link
          to={isLoggedIn ? "/profile" : "/login"}
          className="btn btn-primary btn-lg mt-3"
        >
          {isLoggedIn ? "Jump back into your notes" : "Get Started"}
        </Link>
      </div>

<div className="section-divider"></div>


{/* ================= FEATURES SECTION ================= */}

<section className="features-section">

  <div className="features-container text-center">
    
    <h2 className="fw-bold mb-3">Why Use NoteVault?</h2>
    <p className="features-subtext">
      Everything you need to organize, protect, and manage your digital thoughts — all in one place.
    </p>

    <div className="features-grid">

      <div className="feature-card">
        <div className="feature-icon">🔒</div>
        <h4>Secure Notes</h4>
        <p>
          Your notes, images, and attachments are encrypted and accessible only to you.
        </p>
      </div>

      <div className="feature-card">
        <div className="feature-icon">⚡</div>
        <h4>Fast & Simple</h4>
        <p>
          A distraction-free interface designed for speed and productivity.
        </p>
      </div>

      <div className="feature-card">
        <div className="feature-icon">🔗</div>
        <h4>Attach Anything</h4>
        <p>
          Add images, PDFs, and documents directly to your notes.
        </p>
      </div>

      <div className="feature-card">
        <div className="feature-icon">🏷️</div>
        <h4>Custom Tags</h4>
        <p>
          Organize notes using flexible tags like work, personal, or priority.
        </p>
      </div>

      <div className="feature-card">
        <div className="feature-icon">⏰</div>
        <h4>Reminders</h4>
        <p>
          Set reminders so you never miss important tasks or follow-ups.
        </p>
      </div>

      <div className="feature-card">
        <div className="feature-icon">🕘</div>
        <h4>Version History</h4>
        <p>
          Track changes automatically and restore previous versions anytime.
        </p>
      </div>

    </div>

  </div>

</section>

<div className="section-divider"></div>


{/* ========================How It Works Section==================== */}
<div className="how-section text-center">
  <h2 className="fw-bold mb-5">How It Works</h2>

  <div className="row justify-content-center">

    <div className="col-md-3 col-sm-6 mb-4">
      <div className="how-step">
        <div className="step-number">1</div>
        <h5>Create Notes</h5>
        <p>Write rich text notes, attach files, and organize with tags.</p>
      </div>
    </div>

    <div className="col-md-3 col-sm-6 mb-4">
      <div className="how-step">
        <div className="step-number">2</div>
        <h5>Stay Organized</h5>
        <p>Filter by tags, set reminders, and track version history.</p>
      </div>
    </div>

    <div className="col-md-3 col-sm-6 mb-4">
      <div className="how-step">
        <div className="step-number">3</div>
        <h5>Access Anywhere</h5>
        <p>Securely access your notes anytime from any device.</p>
      </div>
    </div>

  </div>
</div>
<div className="section-divider"></div>



      {/* Live Demo Notes Section */}
      <div className="mt-5">
        <h2 className="fw-bold text-center mb-4">See NoteVault in Action</h2>
        <p className="text-center mb-4">
          A preview of how your notes will look inside the notebook.
        </p>

        <div className="row">

          {/* Demo Note 1 */}
          <div className="col-md-3 mb-3">
            <div className="card shadow-sm h-100">
              <div className="card-body  ">
                <small className="badge text-bg-secondary">personal</small>
                <h5 className="card-title mt-2  ">Morning Routine</h5>
                <p className="card-text">
                  Water, workout.
                  Everything starts with a good morning!
                </p>
                <i className="fa-solid fa-user-pen mx-2"></i>
                <i className="fa-solid fa-trash-can mx-2"></i>
              </div>
            </div>
          </div>

          {/* Demo Note 2 */}
          <div className="col-md-3 mb-3">
            <div className="card shadow-sm h-100  ">
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
            <div className="card shadow-sm h-100  ">
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
            <div className="card shadow-sm h-100 " >
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
<div className="section-divider"></div>

    {/* =================CTA SECTION ================= */}

<section className="cta">
  <div className="cta-card">

    <h2 className="cta-title">
      Ready to organize your life?
    </h2>

    <p className="cta-text">
      {isLoggedIn
        ? "Open your notebook and continue where you left off."
        : "Create an account and start taking notes instantly."}
    </p>

    <Link
      to={isLoggedIn ? "/profile" : "/signup"}
      className="btn btn-primary final-cta-btn"
    >
      {isLoggedIn ? "Go to Your Notebook" : "Create Free Account"}
    </Link>

  </div>
</section>

<div className="section-divider"></div>



    </div>
    
  );
};

export default Home;

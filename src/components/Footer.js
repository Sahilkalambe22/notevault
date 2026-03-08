import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="nv-footer mt-5">
  <div className="container-fluid">
    <div className="container py-5">
      <div className="row gy-4">

        {/* Brand */}
        <div className="col-md-4">
          <h4 className="nv-footer-logo">NoteVault</h4>
          <p className="nv-footer-text">
            Secure. Organize. Access anywhere.<br></br>
            Your personal digital note vault.
          </p>
        </div>

        {/* Links */}
        <div className="col-md-4">
          <h5 className="nv-footer-heading">Quick Links</h5>
          <ul className="nv-footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/signup">Signup</Link></li>
          </ul>
        </div>

        {/* Social */}
        <div className="col-md-4">
          <h5 className="nv-footer-heading">Connect With Us</h5>
          <div className="nv-footer-socials">
            <a href="/"><i className="fa-brands fa-github"></i></a>
            <a href="/"><i className="fa-brands fa-linkedin"></i></a>
            <a href="/"><i className="fa-brands fa-twitter"></i></a>
          </div>
        </div>

      </div>

      <hr className="nv-footer-divider" />

      <div className="text-center nv-footer-bottom">
        © {new Date().getFullYear()} NoteVault. All rights reserved.
      </div>
    </div>
  </div>
</footer>
  );
}
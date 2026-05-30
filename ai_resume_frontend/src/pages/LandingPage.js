import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LandingPage.css";

const LandingPage = () => {
  const [searchValue, setSearchValue] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [counts, setCounts] = useState({ jobs: 0, seekers: 0, employers: 0 });
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  const navigate = useNavigate();

  const words = ["Dream Job", "Perfect Role", "Next Opportunity", "Career Growth"];

  const handleSearch = () => {
    if (searchValue.trim() !== "") {
      setAlertMessage("Please login or register first");
      setTimeout(() => setAlertMessage(""), 3000);
    }
  };

  // Number counter animation
  useEffect(() => {
    let jobs = 0, seekers = 0, employers = 0;
    const interval = setInterval(() => {
      if (jobs < 10000) jobs += 250;
      if (seekers < 50000) seekers += 1500;
      if (employers < 5000) employers += 120;

      setCounts({
        jobs: Math.min(jobs, 10000),
        seekers: Math.min(seekers, 50000),
        employers: Math.min(employers, 5000),
      });

      if (jobs >= 10000 && seekers >= 50000 && employers >= 5000)
        clearInterval(interval);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Thumbtack-style title animation
  useEffect(() => {
    const wordInterval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(wordInterval);
  }, [words.length]);

  return (
    <div className="landing-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">SmartHire</div>
        <div className="nav-buttons">
          <button
            className="landing-login-btn"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
          <button
            className="landing-register-btn"
            onClick={() => navigate("/register")}
          >
            Register
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay">
          <h1 className="animated-text">
            Find Your <span className="thumbtack-word">{words[currentWordIndex]}</span> Today
          </h1>
          <p>
            SmartHire connects Jobseekers & Employers with AI-powered resume
            matching.
          </p>
          <div className="search-box">
            <input
              type="text"
              placeholder="Search Jobs or Companies..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <button onClick={handleSearch}>Search</button>
          </div>
          {alertMessage && <div className="search-alert">{alertMessage}</div>}
        </div>
      </section>

      {/* About Section */}
      <section className="about">
        <h2>Why Choose SmartHire?</h2>
        <p>
          Our platform is designed to make hiring & job searching seamless.
          Whether you're an employer looking for the best talent or a jobseeker
          searching for your next opportunity - SmartHire has you covered.
        </p>
      </section>

      {/* Features */}
      <section className="features">
        <div className="feature-card">
          <img
            src="https://img.icons8.com/ios-filled/100/001f3f/briefcase.png"
            alt="Post Job"
          />
          <h3>Post a Job</h3>
          <p>Employers can post jobs easily and reach thousands of candidates.</p>
        </div>
        <div className="feature-card">
          <img
            src="https://img.icons8.com/ios-filled/100/001f3f/resume.png"
            alt="Resume"
          />
          <h3>Create & Update Resume</h3>
          <p>Job seekers can create and update resumes with just a few clicks.</p>
        </div>
        <div className="feature-card">
          <img
            src="https://img.icons8.com/ios-filled/100/001f3f/trust.png"
            alt="Trusted"
          />
          <h3>AI Recommendations</h3>
          <p>Get smart job recommendations based on your skills & profile.</p>
        </div>
      </section>

      {/* Stats */}
      <section className="stats">
        <div className="stat-box">
          <h2>{counts.jobs.toLocaleString()}+</h2>
          <p>Active Job Listings</p>
        </div>
        <div className="stat-box">
          <h2>{counts.seekers.toLocaleString()}+</h2>
          <p>Jobseekers Registered</p>
        </div>
        <div className="stat-box">
          <h2>{counts.employers.toLocaleString()}+</h2>
          <p>Employers Trust Us</p>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-card">
          <h2>Ready to Get Started?</h2>
          <p>
            Join SmartHire today and take your career or company to the next
            level.
          </p>
          <button onClick={() => navigate("/register")}>Join Now</button>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <p>© 2025 SmartHire. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;

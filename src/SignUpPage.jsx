import React from "react";

function SignUpPage({ onClose }) {
  return (
    <div className="signup-modal-overlay">
      <div className="signup-modal-form">
        <button className="signup-close-btn" onClick={onClose} aria-label="Close">&times;</button>
        <section className="signup-section about-section">
          <h2>Sign Up</h2>
          <form className="signup-form">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input type="text" id="name" name="name" placeholder="Your Name" required />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" placeholder="you@email.com" required />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" name="password" placeholder="Password" required />
            </div>
            <button type="submit" className="cta-button" style={{ width: '100%', marginTop: '1.5rem' }}>Create Account</button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default SignUpPage; 
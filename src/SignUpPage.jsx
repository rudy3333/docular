import React, { useState } from "react";

function SignUpPage({ onClose, switchToLogin }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Account created!" });
        setForm({ name: "", email: "", password: "" });
        setTimeout(() => {
          if (onClose) onClose();
        }, 2000);
      } else {
        setMessage({ type: "error", text: data.error || "Sign up failed." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Network error." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-modal-overlay">
      <div className="signup-modal-form">
        <button className="signup-close-btn" onClick={onClose} aria-label="Close">&times;</button>
        <section className="signup-section about-section">
          <h2>Sign Up</h2>
          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input type="text" id="name" name="name" value={form.name} onChange={handleChange} placeholder="Your Name" required />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" value={form.email} onChange={handleChange} placeholder="you@email.com" required />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" name="password" value={form.password} onChange={handleChange} placeholder="Password" required />
            </div>
            <button type="submit" className="cta-button" style={{ width: '100%', marginTop: '1.5rem' }} disabled={loading}>
              {loading ? "Creating..." : "Create Account"}
            </button>
            {message && (
              <div style={{
                color: message.type === "error" ? "red" : "#22c55e",
                background: message.type === "success" ? "#e6ffe6" : message.type === "error" ? "#ffe6e6" : "transparent",
                fontWeight: message.type === "success" || message.type === "error" ? "bold" : "normal",
                borderRadius: "4px",
                padding: "0.5rem 1rem",
                marginTop: "1rem",
                boxShadow: message.type === "success"
                  ? "0 0 8px #22c55e55"
                  : message.type === "error"
                  ? "0 0 8px #ff000055"
                  : "none"
              }}>
                {message.text}
              </div>
            )}
          </form>
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            Already have an account?{' '}
            <button type="button" style={{ color: '#007bff', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }} onClick={switchToLogin}>Login</button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default SignUpPage; 
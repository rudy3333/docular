import React, { useState } from "react";

function LoginPage({ onClose, switchToSignUp }) {
  const [form, setForm] = useState({ email: "", password: "" });
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
      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Login successful!" });
        setForm({ email: "", password: "" });
      } else {
        setMessage({ type: "error", text: data.error || "Login failed." });
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
          <h2>Login</h2>
          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" value={form.email} onChange={handleChange} placeholder="you@email.com" required />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" name="password" value={form.password} onChange={handleChange} placeholder="Password" required />
            </div>
            <button type="submit" className="cta-button" style={{ width: '100%', marginTop: '1.5rem' }} disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
            {message && (
              <div style={{ color: message.type === "error" ? "red" : "green", marginTop: "1rem" }}>
                {message.text}
              </div>
            )}
          </form>
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            Don\'t have an account?{' '}
            <button type="button" style={{ color: '#007bff', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }} onClick={switchToSignUp}>Sign Up</button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default LoginPage; 
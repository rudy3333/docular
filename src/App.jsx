import './App.css';

function App() {
  return (
    <div className="landing-page">
      {/* Header Navigation */}
      <nav className="header-nav">
        <span className="logo">Docular</span>
        <div className="nav-links">
          <a href="#how" className="nav-link">How it works</a>
          <a href="#use-cases" className="nav-link">Use cases</a>
          <a href="#pricing" className="nav-link">Pricing</a>
          <a href="#help" className="nav-link">Help</a>
          <a href="#login" className="nav-link">Log in</a>
          <a href="#signup" className="nav-link cta-button" style={{padding: '0.5rem 1.5rem', fontSize: '1rem'}}>Sign up</a>
      </div>
      </nav>

      {/* Hero Section */}
      <header className="hero">
        <h1 className="hero-title">Everything You Need.<br />Before You Ask.</h1>
        <p className="tagline">Docular is an AI that lets you chat with your documents and get instant answers — in real time.</p>
        <a href="#get-started" className="cta-button">Get Started</a>
      </header>

      {/* Features Section */}
      <section className="features">
        <h2>Features</h2>
        <ul>
          <li>Upload your documents and ask questions in natural language</li>
          <li>AI-powered answers tailored to your content</li>
          <li>Secure, private, and fast</li>
        </ul>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Docular. All rights reserved.</p>
      </footer>
      </div>
  );
}

export default App;

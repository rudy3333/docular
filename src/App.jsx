import './App.css';

function App() {
  return (
    <div className="landing-page">
      {/* Header Navigation */}
      <nav className="header-nav">
        <span className="logo">Docular</span>
        <div className="nav-links">
          <a href="#how" className="nav-link">How it works</a>
          <a href="#help" className="nav-link">Help</a>
          <a href="#login" className="nav-link">Log in</a>
          <a href="#signup" className="nav-link cta-button" style={{padding: '0.5rem 1.5rem', fontSize: '1rem'}}>Sign up</a>
      </div>
      </nav>

      {/* Hero Section */}
      <header className="hero">
        <h1 className="hero-title">THE AI<br />document chat.</h1>
        <p className="tagline">Docular is an AI that lets you chat with your documents and get instant answers — in real time.</p>
        <a href="#get-started" className="cta-button">Get Started</a>
      </header>

      {/* About Section */}
      <section className="about-section">
        <h2>About Docular</h2>
        <p>Docular is revolutionizing the way students and professionals interact with their documents. Our AI-powered platform enables instant, intelligent conversations with your files, making research, studying, and information retrieval faster and easier than ever before.</p>
      </section>

      {/* Trusted Institutions Section */}
      <section className="trusted-institutions">
        <h3>Trusted by students in these institutions</h3>
        <div className="institutions-logos">
          <img className="institution-img" src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Harvard_University_logo.svg/1280px-Harvard_University_logo.svg.png" alt="Harvard University Logo" />
          <img className="institution-img" src="https://1000logos.net/wp-content/uploads/2022/08/MIT-Logo.png" alt="MIT Logo" />
          <img className="institution-img" src="https://assurgentmedical.com/wp-content/uploads/2017/07/stanford-logo-660x330.png" alt="Stanford University Logo" />
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <h2>What Students Are Saying</h2>
        <div className="testimonials">
          <blockquote>“Docular saved me hours of research time. I can finally focus on learning, not searching!”<br /><span>- Emily, Harvard</span></blockquote>
          <blockquote>“The AI answers are spot-on and super fast. A must-have for any student.”<br /><span>- Alex, MIT</span></blockquote>
          <blockquote>“I love how easy it is to upload and chat with my notes. Game changer!”<br /><span>- Priya, Stanford</span></blockquote>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Features</h2>
        <ul>
          <li>Upload your documents and ask questions in natural language</li>
          <li>AI-powered answers tailored to your content</li>
          <li>Secure, private, and fast</li>
          <li>Supports PDFs, Word, and more</li>
          <li>Export chat history and highlights</li>
          <li>Collaborate with classmates in shared workspaces</li>
        </ul>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <h2>Ready to get started?</h2>
        <p>Join thousands of students and professionals using Docular to supercharge their productivity.</p>
        <a href="#signup" className="cta-button" style={{fontSize: '1.3rem', padding: '1.2rem 3rem'}}>Sign Up Free</a>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Docular. All rights reserved.</p>
      </footer>
      </div>
  );
}

export default App;

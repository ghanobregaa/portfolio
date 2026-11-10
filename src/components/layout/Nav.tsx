export function Nav() {
  return (
    <nav className="nav">
      <div className="container">
        <a className="mark" href="#top">gn<i>_</i></a>
        <div className="nav-links">
          <a href="#about" data-link="about">About</a>
          <a href="#experience" data-link="experience">Experience</a>
          <a href="#craft" data-link="craft">Craft</a>
          <a href="#contact" data-link="contact">Elsewhere</a>
          <button className="theme-btn" id="theme-toggle" type="button" aria-label="Toggle theme">
            <svg className="i-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
            <svg className="i-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
          </button>
        </div>
      </div>
    </nav>
  );
}

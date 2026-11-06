export function Contact() {
  return (
      <section id="contact" className="contact">
        <div className="container">
          <h2 className="label" data-n="10" data-scramble>Contact</h2>
          <div className="sand-card" id="sand-card">
            <canvas id="sand" aria-hidden="true"></canvas>
            <div className="sand-content">
          <p className="big" id="big" data-reveal><span className="w">Got</span> <span className="w">a</span> <span className="w">question?</span> <span className="w acc">Say</span> <span className="w acc">hello.</span></p>
          <p data-reveal>Questions, ideas or just a hello. I read everything.</p>
          <div className="email-line" data-reveal>
            <code id="email">ghanobrega@gmail.com</code>
            <button className="btn magnetic" id="copy-btn" type="button"><span className="roll"><span id="copy-a">Copy</span><span id="copy-b">Copy</span></span></button>
          </div>
          <div className="socials" data-reveal>
            <a href="https://www.linkedin.com/in/ghanobrega" target="_blank" rel="noopener">LinkedIn<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7 17 17 7M8 7h9v9" /></svg></a>
            <a href="https://github.com/ghanobregaa" target="_blank" rel="noopener">GitHub<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7 17 17 7M8 7h9v9" /></svg></a>
            <a href="https://www.instagram.com/ghanobrega" target="_blank" rel="noopener">Instagram<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7 17 17 7M8 7h9v9" /></svg></a>
          </div>
            </div>
          </div>
        </div>
      </section>
  );
}

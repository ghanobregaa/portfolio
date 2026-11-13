export function Morph() {
  return (
      <section className="morph" id="morph" aria-label="Particles morphing through what I build">
        <div className="morph-sticky">
          <canvas id="morph-cv" aria-hidden="true"></canvas>
          <div className="morph-hint"><span>scroll to morph</span><span>move to scatter</span></div>
          <div className="container morph-cap">
            <div className="mc-idx"><b id="mc-i">01</b> / 05</div>
            <div className="mc-stack" id="mc-stack">
              <div className="mc on"><h3 className="glitch" data-text="Automation">Automation</h3><p>Machines doing the boring parts.</p></div>
              <div className="mc"><h3 className="glitch" data-text="Mobile Apps">Mobile Apps</h3><p>One codebase. Every pocket.</p></div>
              <div className="mc"><h3 className="glitch" data-text="Integrations">Integrations</h3><p>Systems that finally talk to each other.</p></div>
              <div className="mc"><h3 className="glitch" data-text="Websites">Websites</h3><p>Fast, clean and made to last.</p></div>
              <div className="mc"><h3 className="glitch" data-text="Guilherme Nóbrega">Guilherme Nóbrega</h3><p>That's me. Keep scrolling.</p></div>
            </div>
            <div className="mc-bar"><i id="mc-bar"></i></div>
          </div>
        </div>
      </section>
  );
}

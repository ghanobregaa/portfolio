// Warp: idea to production. A portal opens, objects fly out of a starfield that speeds up with your scroll, and it closes behind you; driven by the engine.

export function Warp() {
  return (
    <section id="warp" className="wp" aria-label="From idea to production: idea, design, API, app, production">
      <div className="wp-sticky" id="wp-sticky">
        <div className="wp-clip" id="wp-clip">
          <canvas id="wp-cv" className="wp-cv" aria-hidden="true"></canvas>
          <canvas id="wp-gl" className="wp-cv" aria-hidden="true"></canvas>
          <div className="wp-cap" id="wp-cap" aria-hidden="true"><span id="wp-cap-n">01</span><b id="wp-cap-t">Idea</b><em id="wp-cap-d">a sketch, a problem, a "what if"</em></div>
          <div className="wp-end" id="wp-end">
            <p className="wp-final">From idea<br />to <span>production.</span></p>
            <p className="wp-sub">// the whole path, end to end</p>
          </div>
          <div className="container wp-hud" aria-hidden="true">
            <span className="wp-hint" id="wp-hint">scroll to accelerate</span>
            <span className="wp-speed"><i id="wp-bar"></i><b id="wp-v">0.00</b> c</span>
          </div>
        </div>
        <div className="wp-ring" id="wp-ring" aria-hidden="true"></div>
        <ol className="sr-only"><li>Idea</li><li>Design</li><li>API</li><li>App</li><li>Production</li></ol>
      </div>
    </section>
  );
}

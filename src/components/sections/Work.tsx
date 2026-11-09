export function Work() {
  return (
      <section id="craft" className="lp" aria-label="A 3D laptop opens, the code types itself and my stack jumps out of the screen">
        <div className="lp-sticky" id="lp-sticky">
          <canvas id="lp-gl" aria-hidden="true"></canvas>
          <div className="container lp-head" id="lp-head">
            <h2 className="label" data-n="03" data-scramble>Full stack</h2>
            <p className="lp-title">Open it up.<br /><span>See what's inside.</span></p>
          </div>
          <div className="lp-screen" id="lp-screen" aria-hidden="true">
            <span className="lp-notch"><i></i></span>
            <div className="lp-ed" id="lp-ed">
              <div className="lp-bar"><span className="d"><i></i><i></i><i></i></span><span className="f">stack.ts</span><span className="s" id="lp-st">● editing</span></div>
              <pre className="lp-code" id="lp-code"></pre>
              <div className="lp-build" id="lp-build"><span id="lp-bt">$ npm run build</span><b><i id="lp-bp"></i></b></div>
            </div>
            <div className="lp-app" id="lp-app">
              <div className="lp-view" id="lp-view"></div>
              <span className="mp-toast">✓ build succeeded · 0.42s</span>
            </div>
          </div>
          <div className="lp-chips" id="lp-chips"></div>
          <div className="lp-over" id="lp-over" aria-hidden="true"></div>
          <div className="container lp-foot" aria-hidden="true"><span id="lp-cap">// scroll to open</span></div>
        </div>
      </section>
  );
}

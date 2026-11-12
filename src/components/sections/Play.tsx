// Play: a pocket console. The whole portfolio in 160 x 144 pixels; driven by the engine.

export function Play() {
  return (
    <section id="play" className="gbs" aria-label="A pocket console: the whole portfolio squeezed into 160 by 144 pixels">
      <div className="container gbs-wrap">
        <div className="gbs-copy">
          <h2 className="label" data-scramble>Play</h2>
          <p className="gbs-title">Insert coin.<br /><span>Or just press start.</span></p>
          <p className="gbs-text">The whole portfolio, squeezed into 160 × 144 pixels and four shades of pink. Power it on and have a look around.</p>
          <ul className="gbs-keys">
            <li><span><kbd>↑</kbd><kbd>↓</kbd><kbd>←</kbd><kbd>→</kbd></span><em>move</em></li>
            <li><span><kbd>Enter</kbd></span><em>A · open</em></li>
            <li><span><kbd>Backspace</kbd></span><em>B · back</em></li>
            <li><span><kbd>Space</kbd></span><em>start · pause</em></li>
          </ul>
          <div className="gbs-status"><span className="gbs-dot" id="gb-state"></span><span id="gb-state-t">click the console to use your keyboard</span><button type="button" className="gbs-sound" id="gb-sound" aria-pressed="true">sound on</button></div>
        </div>
        <div className="gbs-stage" id="gb-stage">
          <div className="gb" id="gb" role="application" aria-label="Pocket console. Use the arrow keys, Enter and Backspace once it is on.">
            <button type="button" className="gb-power" id="gb-power" aria-pressed="false" aria-label="Power"><i></i></button>
            <span className="gb-pw-l">OFF · ON</span>
            <div className="gb-bezel">
              <span className="gb-top"><i></i><em>160 × 144 · 4 SHADES</em><i></i></span>
              <span className="gb-led" aria-hidden="true"></span><span className="gb-led-l">POWER</span>
              <div className="gb-screen" id="gb-screen">
                <canvas id="gb-lcd" width="160" height="144" aria-hidden="true"></canvas>
                <button type="button" className="gb-hint" id="gb-hint">PRESS POWER</button>
              </div>
            </div>
            <span className="gb-brand"><b>gn</b>pocket</span>
            <div className="gb-dpad" aria-hidden="true">
              <button type="button" tabIndex={-1} className="up" data-k="up"></button>
              <button type="button" tabIndex={-1} className="left" data-k="left"></button>
              <button type="button" tabIndex={-1} className="right" data-k="right"></button>
              <button type="button" tabIndex={-1} className="down" data-k="down"></button>
              <i></i>
            </div>
            <div className="gb-ab" aria-hidden="true">
              <span><button type="button" tabIndex={-1} data-k="b"></button><em>B</em></span>
              <span><button type="button" tabIndex={-1} data-k="a"></button><em>A</em></span>
            </div>
            <div className="gb-ss" aria-hidden="true">
              <span><button type="button" tabIndex={-1} data-k="select"></button><em>SELECT</em></span>
              <span><button type="button" tabIndex={-1} data-k="start"></button><em>START</em></span>
            </div>
            <div className="gb-spk" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>
          </div>
        </div>
      </div>
    </section>
  );
}

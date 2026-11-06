export function Playground() {
  return (
      <section id="playground">
        <div className="container">
          <h2 className="label" data-scramble>Playground</h2>
          <div className="view-tabs pg-tabs" role="tablist">
            <button className="vt on" type="button" role="tab" aria-selected="true" data-pg="terminal">terminal</button>
            <button className="vt" type="button" role="tab" aria-selected="false" data-pg="race">type race</button>
            <button className="vt" type="button" role="tab" aria-selected="false" data-pg="game">bug hunt</button>
            <button className="vt" type="button" role="tab" aria-selected="false" data-pg="visit">live</button>
          </div>
          <div className="pg-panel" data-panel="terminal">
          <div className="term" data-reveal>
            <div className="term-bar"><span>guest@gn: ~</span><span className="live"><span className="dot"></span>interactive</span></div>
            <div className="term-body" id="term-body">
              <div id="term-out"></div>
              <div className="term-input-row"><span className="p">~ $</span><input id="term-input" type="text" autoComplete="off" autoCapitalize="off" spellCheck="false" aria-label="Type a command" /></div>
            </div>
          </div>
          <div className="term-chips" id="term-chips">
            <button type="button" data-cmd="whoami">whoami</button>
            <button type="button" data-cmd="stack">stack</button>
            <button type="button" data-cmd="ls">ls</button>
            <button type="button" data-cmd="coffee">coffee</button>
            <button type="button" data-cmd="eggs">eggs</button>
          </div>
          </div>
          <div className="pg-panel" data-panel="race" hidden>
          <div className="race" data-reveal>
            <div className="race-head">
              <div className="racer"><small>you</small><b id="r-you">0</b><span>wpm</span></div>
              <div className="racer ghost"><small>my ghost</small><b id="r-ghost">35</b><span>wpm</span></div>
              <div className="racer"><small>time</small><b id="r-time">0.0</b><span>s</span></div>
            </div>
            <div className="race-track">
              <div className="lane-r"><span className="who">you</span><div className="rt-line"><i className="runner" id="run-you"></i></div></div>
              <div className="lane-r ghost"><span className="who">ghost</span><div className="rt-line"><i className="runner" id="run-ghost"></i></div></div>
            </div>
            <div className="race-box" id="race-box">
              <div className="race-text" id="race-text" aria-hidden="true"></div>
              <input id="race-input" className="race-input" type="text" autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck="false" aria-label="Type the code snippet" />
            </div>
            <div className="race-foot">
              <span className="race-msg" id="race-msg">Click the snippet and start typing. My ghost starts when you do.</span>
              <button className="btn" id="race-new" type="button">New snippet</button>
            </div>
          </div>
          </div>
          <div className="pg-panel" data-panel="game" hidden>
          <div className="game" data-reveal>
            <div className="game-hud">
              <div><small>squashed</small><b id="g-score">0</b></div>
              <div><small>combo</small><b id="g-combo">x1</b></div>
              <div><small>prod</small><b id="g-lives" className="lives"><i></i><i></i><i></i></b></div>
              <div><small>best</small><b id="g-best">0</b></div>
            </div>
            <div className="game-stage" id="game-stage">
              <canvas id="game-cv" role="img" aria-label="Bug hunt: squash bugs before they reach production"></canvas>
              <div className="game-overlay" id="game-overlay">
                <b id="go-title" className="glitch" data-text="Bugs are crawling to production.">Bugs are crawling to production.</b>
                <span id="go-sub">Click or tap them before they reach PROD. Pink ones are critical (+5). Leave the <code>feat</code> boxes alone. Three escapes and prod goes down.</span>
                <button className="btn primary" id="game-start" type="button">Start debugging</button>
              </div>
            </div>
          </div>
          </div>
          <div className="pg-panel" data-panel="visit" hidden>
          <div className="viz" data-reveal>
            <div className="viz-head">
              <div className="viz-big"><small>activity right now</small><b id="v-now">0</b><span className="u">px/s</span></div>
              <div className="viz-meta">
                <span className="live"><span className="dot"></span>live · last 60s</span>
                <span>peak <b id="v-peak">0</b></span>
                <span>here <b id="v-time">0:00</b></span>
              </div>
            </div>
            <div className="viz-chart">
              <canvas id="v-main" role="img" aria-label="Live area chart of your mouse and scroll activity over the last minute"></canvas>
              <div className="v-tip" id="v-tip" hidden></div>
            </div>
            <div className="viz-cards">
              <div className="vc"><small>scroll depth</small><b id="vc-scroll">0%</b><canvas data-spark="scroll" aria-hidden="true"></canvas></div>
              <div className="vc"><small>clicks</small><b id="vc-clicks">0</b><canvas data-spark="clicks" aria-hidden="true"></canvas></div>
              <div className="vc"><small>keys typed</small><b id="vc-keys">0</b><canvas data-spark="keys" aria-hidden="true"></canvas></div>
            </div>
            <p className="viz-note">Move, scroll, click or type and watch yourself become data. Measured in your browser only. Nothing leaves this page.</p>
          </div>
          </div>
        </div>
      </section>
  );
}

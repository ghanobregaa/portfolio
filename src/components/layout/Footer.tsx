export function Footer() {
  return (
    <footer id="footer">
      <div className="curtain" id="curtain">
      <div className="giant glitch" id="giant" data-text="GUILHERME NÓBREGA" aria-hidden="true">GUILHERME NÓBREGA</div>
      <div className="container">
        <span>© <span id="year">2026</span> Guilherme Nóbrega</span>
        <button className="egg-count" id="egg-count" type="button" title="Easter eggs found. Click for a hint.">eggs <b id="egg-n">0</b>/<span id="egg-t">12</span></button>
        <button className="top-btn" id="top-btn" type="button">Back to top ↑</button>
      </div>
      </div>
    </footer>
  );
}

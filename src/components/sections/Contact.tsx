// Elsewhere: three big doors (LinkedIn, GitHub, Instagram). Hovering one floods it with pink, rolls its name and
// shows a little preview of what is behind it, floating with the cursor.

const ARROW = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M8 7h9v9" /></svg>;

const LINKS = [
  { k: "li", n: "01", name: "LinkedIn", note: "Career, the polished version", handle: "/in/ghanobrega", href: "https://www.linkedin.com/in/ghanobrega" },
  { k: "gh", n: "02", name: "GitHub", note: "Code, the honest version", handle: "@ghanobregaa", href: "https://github.com/ghanobregaa" },
  { k: "ig", n: "03", name: "Instagram", note: "Everything else", handle: "@ghanobrega", href: "https://www.instagram.com/ghanobrega" },
];

export function Contact() {
  return (
      <section id="contact" className="contact ct">
        <div className="container">
          <h2 className="label" data-scramble>Elsewhere</h2>
          <div className="ct-top">
            <p className="ct-title" data-reveal>Find me <span>online.</span></p>
            <p className="ct-sub" data-reveal>Three doors. Pick one.</p>
          </div>
          <ul className="ct-list">
            {LINKS.map((l) => (
              <li key={l.k} data-reveal>
                <a className="ct-row" href={l.href} target="_blank" rel="noopener" data-k={l.k}>
                  <span className="ct-n">{l.n}</span>
                  <span className="ct-name" data-t={l.name}>{l.name}</span>
                  <span className="ct-meta"><span className="ct-note">{l.note}</span><span className="ct-handle">{l.handle}</span></span>
                  <span className="ct-arrow" aria-hidden="true">{ARROW}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="ct-peek" id="ct-peek" aria-hidden="true">
          <div className="pk pk-li">
            <span className="pk-cover"></span>
            <span className="pk-av">gn</span>
            <b>Guilherme Nóbrega</b>
            <em>Full-stack developer</em>
            <span className="pk-btn">+ Connect</span>
          </div>
          <div className="pk pk-gh">
            <span className="pk-head"><b>ghanobregaa</b><em>contributions</em></span>
            <span className="pk-grid" id="pk-grid"></span>
            <span className="pk-legend"><em>Less</em><i></i><i></i><i></i><i></i><em>More</em></span>
          </div>
          <div className="pk pk-ig">
            <span className="pk-head"><b>@ghanobrega</b><em>posts</em></span>
            <span className="pk-tiles">{Array.from({ length: 9 }).map((_, i) => <i key={i} style={{ ["--i" as string]: i }}></i>)}</span>
          </div>
        </div>
      </section>
  );
}

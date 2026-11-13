import portraitImg from "@/assets/portrait.png";

export function Hero() {
  return (
      <div className="hero-wrap" id="hero-wrap">
        <canvas id="topo" aria-hidden="true"></canvas>
        <canvas id="portrait" className="hero-portrait" aria-hidden="true" data-src={portraitImg}></canvas>
        <header className="container hero">
          <h1 aria-label="Guilherme Nóbrega, full-stack developer">
            <span className="line glitch" id="name-line" data-text="Guilherme Nóbrega" data-split>Guilherme Nóbrega</span>
            <span className="line sub" data-split id="rotator">Full-stack developer</span>
          </h1>
          <div hidden>
            <span className="status-text" id="status-text"><span></span><span id="greet"></span></span>
            <em id="clock"></em><em id="years">5</em>
          </div>
        </header>
        <a className="scroll-cue" href="#about" aria-label="Scroll down"><span>scroll</span><i></i></a>
      </div>
  );
}

export function About() {
  return (
      <section id="about">
        <div className="container">
          <h2 className="label" data-n="01" data-scramble>About</h2>
          <div className="about-grid">
            <div className="prose" id="prose">
              <p>I'm <em id="age">26</em>, a developer who likes the whole path from idea to production: designing the interface, writing the API behind it and automating whatever someone is still doing by hand.</p>
              <p>I care about the details people feel but rarely notice: pages that load instantly, apps that respond to every tap, systems that talk to each other and automations that quietly save hours every week.</p>
            </div>
            <div className="globe-wrap">
              <canvas className="globe" id="globe" role="img" aria-label="Dotted globe with Madeira marked"></canvas>
              <span className="globe-cap"><button className="coords" id="coords" type="button">32.65° N · 16.91° W</button> · drag to spin</span>
            </div>
          </div>
        </div>
      </section>
  );
}

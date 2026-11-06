export function Experience() {
  return (
      <section id="experience">
        <div className="container">
          <h2 className="label" data-n="02" data-scramble>Experience</h2>
          <div className="view-tabs" role="tablist">
            <button className="vt on" type="button" role="tab" aria-selected="true" data-view="timeline">timeline</button>
            <button className="vt" type="button" role="tab" aria-selected="false" data-view="git">git log</button>
          </div>
          <pre className="gitlog" id="gitlog" hidden></pre>
          <div className="timeline" id="timeline">
            <div className="rail"></div>
            <article className="job now spot" data-reveal>
              <span className="node"></span>
              <div className="what">
                <div className="top">
                  <h3><a href="https://www.afa.pt" target="_blank" rel="noopener">Grupo AFA<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7 17 17 7M8 7h9v9" /></svg></a></h3>
                  <span className="when">2022 — Present</span>
                </div>
                <div className="role">Software Developer</div>
                <p>Building mobile apps, web tools, integrations and automations, from the first sketch to production.</p>
                <div className="tags"><span className="tag">Flutter</span><span className="tag">Python</span><span className="tag">React</span><span className="tag">Firebase</span></div>
              </div>
            </article>
            <article className="job spot" data-reveal>
              <span className="node"></span>
              <div className="what">
                <div className="top">
                  <h3><a href="https://www.savoysignature.com" target="_blank" rel="noopener">Savoy Signature<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7 17 17 7M8 7h9v9" /></svg></a></h3>
                  <span className="when">2021 — 2022</span>
                </div>
                <div className="role">Developer</div>
                <p>Mobile apps in Flutter and websites in React on top of REST APIs.</p>
                <div className="tags"><span className="tag">Flutter</span><span className="tag">React</span><span className="tag">REST</span></div>
              </div>
            </article>
          </div>
        </div>
      </section>
  );
}

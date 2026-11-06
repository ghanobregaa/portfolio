export function Work() {
  return (
      <section id="work">
        <div className="container">
          <h2 className="label" data-n="03" data-scramble>What I build</h2>
          <div className="work">
            <div className="pipe spot" data-reveal>
              <div className="pipe-head">
                <div><h3>Automation</h3></div>
                <span className="pipe-count"><em id="run-count">1,042</em> runs</span>
              </div>
              <div className="wf" id="wf">
                <div className="wn"><span className="box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg></span><small>Schedule</small></div>
                <div className="wl"><span className="wfd"></span></div>
                <div className="wn"><span className="box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></svg></span><small>Fetch</small></div>
                <div className="wl"><span className="wfd"></span></div>
                <div className="wn"><span className="box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" /></svg></span><small>Transform</small></div>
                <div className="wl"><span className="wfd"></span></div>
                <div className="wn"><span className="box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4h18l-7 8v6l-4 2v-8z" /></svg></span><small>Filter</small></div>
                <div className="wl"><span className="wfd"></span></div>
                <div className="wn"><span className="box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" /></svg></span><small>Send</small></div>
              </div>
              <div className="wf-log" id="wf-log"><div><span className="m">--:--:--</span> waiting for the next run</div></div>
            </div>
            <div className="tile spot" data-reveal>
              <div className="pipe-head">
                <div><h3>Mobile Apps</h3></div>
                <span className="pipe-count"><em>1</em> codebase · <em>2</em> platforms</span>
              </div>
              <div className="phone-stage">
                <div className="devices">
                  <div className="dev ios"><div className="dev-scr" data-step="1"><span className="notch"></span></div><small>iOS</small></div>
                  <div className="dev android"><div className="dev-scr" data-step="1"><span className="punch"></span></div><small>Android</small></div>
                </div>
                <div className="cmd"><span className="cmd-p">$</span> <span id="cmd-t">flutter run -d all</span></div>
              </div>
            </div>
            <div className="tile spot" data-reveal>
              <div className="pipe-head">
                <div><h3>Websites</h3></div>
                <span className="pipe-count"><em id="perf">100</em> performance</span>
              </div>
              <div className="site-stage">
                <div className="browser built" id="browser">
                  <div className="b-bar"><span className="b-dots"><i></i><i></i><i></i></span><span className="b-url"><span id="b-url">yourbrand.com</span><span className="caret"></span></span></div>
                  <div className="b-page">
                    <div className="b-nav"><span className="b-logo"></span><span className="b-links"><i></i><i></i><i></i></span></div>
                    <div className="b-hero">
                      <span className="b-h1">Make it simple.</span>
                      <span className="b-p">A fast site that feels effortless.</span>
                      <span className="b-btn">Get started</span>
                    </div>
                    <div className="b-cards"><span><i></i></span><span><i></i></span><span><i></i></span></div>
                  </div>
                  <span className="b-cursor" aria-hidden="true"></span>
                </div>
              </div>
            </div>
            <div className="tile wide spot" data-reveal>
              <div className="pipe-head">
                <div><h3>Integrations</h3></div>
                <span className="pipe-count"><em id="lead-count">3,902</em> events synced</span>
              </div>
              <svg className="flow" id="flow" viewBox="0 0 600 170" role="img" aria-label="Three sources flow through a sync hub into a dashboard and email">
                <path id="fp1" className="edge" d="M110 35 C 210 35, 210 85, 290 85" />
                <path id="fp2" className="edge" d="M110 85 L 290 85" />
                <path id="fp3" className="edge" d="M110 135 C 210 135, 210 85, 290 85" />
                <path id="fp4" className="edge" d="M310 85 C 390 85, 390 45, 490 45" />
                <path id="fp5" className="edge" d="M310 85 C 390 85, 390 125, 490 125" />
                <circle className="pulse" r="3.5" /><animateMotion dur="2.4s" repeatCount="indefinite" begin="0s"><mpath href="#fp1" /></animateMotion>
                <circle className="pulse" r="3.5" /><animateMotion dur="2.4s" repeatCount="indefinite" begin="-0.8s"><mpath href="#fp2" /></animateMotion>
                <circle className="pulse" r="3.5" /><animateMotion dur="2.4s" repeatCount="indefinite" begin="-1.6s"><mpath href="#fp3" /></animateMotion>
                <circle className="pulse" r="3.5" /><animateMotion dur="2.4s" repeatCount="indefinite" begin="-1.2s"><mpath href="#fp2" /></animateMotion>
                <circle className="pulse-out" r="4" /><animateMotion dur="1.8s" repeatCount="indefinite" begin="-0.3s"><mpath href="#fp4" /></animateMotion>
                <circle className="pulse-out" r="4" /><animateMotion dur="1.8s" repeatCount="indefinite" begin="-1.2s"><mpath href="#fp4" /></animateMotion>
                <circle className="pulse-out" r="4" /><animateMotion dur="3.6s" repeatCount="indefinite" begin="-0.9s"><mpath href="#fp5" /></animateMotion>
                <rect className="node" x="10" y="20" width={100} height={30} rx="8" /><text x="60" y="40">REST API</text>
                <rect className="node" x="10" y="70" width={100} height={30} rx="8" /><text x="60" y="90">Webhook</text>
                <rect className="node" x="10" y="120" width={100} height={30} rx="8" /><text x="60" y="140">Database</text>
                <circle className="ring" cx="300" cy="85" r="36" />
                <circle className="hub" cx="300" cy="85" r="27" /><text className="hub-t" x="300" y="89">sync</text>
                <rect className="node out" x="490" y="30" width={100} height={30} rx="8" /><text x="540" y="50">Dashboard</text>
                <rect className="node" x="490" y="110" width={100} height={30} rx="8" /><text x="540" y="130">Email</text>
              </svg>
              <div className="payload"><span className="p">POST /sync</span> <code id="payload"></code><span className="caret"></span></div>
            </div>
          </div>
        </div>
      </section>
  );
}

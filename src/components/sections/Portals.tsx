// Scroll "portals": a 3D device shows the next section on its screen, then the camera dives into it.

export function CrtPortal() {
  return (
      <section id="pt-crt" className="pt" data-next="playground" aria-label="An old CRT monitor boots up and opens into the Playground">
        <div className="pt-sticky">
          <canvas className="pt-gl" aria-hidden="true"></canvas>
          <div className="container pt-head">
            <h2 className="label" data-scramble>Old school</h2>
            <p className="pt-title">Before the cloud.<br /><span>Boot it up.</span></p>
          </div>
          <div className="pt-screen crt" aria-hidden="true">
            <div className="crt-boot">
              <pre className="crt-log"></pre>
              <div className="crt-load"><span>LOADING PLAYGROUND.EXE</span><b><i></i></b></div>
            </div>
            <div className="pt-app"><div className="pt-view"></div></div>
            <span className="crt-fx"></span>
            <span className="crt-on"></span>
          </div>
          <div className="container pt-foot" aria-hidden="true"><span className="pt-cap">// scroll to power on</span></div>
        </div>
      </section>
  );
}

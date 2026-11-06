export function Work() {
  return (
      <section id="craft" className="xs" aria-label="Full stack, literally: an app exploded into its five layers">
        <div className="xs-sticky" id="xs-sticky">
          <div className="xs-bgword" id="xs-bgword" aria-hidden="true">STACK</div>
          <div className="container xs-head" id="xs-head">
            <h2 className="label" data-n="03" data-scramble>Full stack</h2>
            <p className="xs-title">Full stack,<br /><span>literally.</span></p>
          </div>
          <div className="xs-scene" aria-hidden="true">
            <div className="xs-stack" id="xs-stack">
              <div className="xs-shadow"></div>
              <div className="xs-layer l-db">
                <span className="xs-tag"><b>01</b> Database</span>
                <div className="db-disks"><i></i><i></i><i></i></div>
                <div className="db-grid">{Array.from({ length: 18 }, (_, i) => <span key={i}></span>)}</div>
              </div>
              <div className="xs-layer l-api">
                <span className="xs-tag"><b>02</b> API</span>
                <div className="api-rows">
                  <div><em>GET</em> /projects <s>200</s></div>
                  <div><em>POST</em> /sync <s>201</s></div>
                  <div><em>PUT</em> /settings <s>204</s></div>
                  <div><em>WS</em> /live <s className="live">●</s></div>
                </div>
              </div>
              <div className="xs-layer l-logic">
                <span className="xs-tag"><b>03</b> Logic</span>
                <div className="code-bars"><i style={{ width: "46%" }}></i><i style={{ width: "62%", marginLeft: "8%" }}></i><i style={{ width: "40%", marginLeft: "16%" }}></i><i style={{ width: "55%", marginLeft: "16%" }}></i><i style={{ width: "30%", marginLeft: "8%" }}></i><i style={{ width: "22%" }}></i></div>
              </div>
              <div className="xs-layer l-layout">
                <span className="xs-tag"><b>04</b> Layout</span>
                <div className="lay-grid"><i className="h"></i><i className="a"></i><i></i><i></i><i></i></div>
              </div>
              <div className="xs-layer l-ui">
                <span className="xs-tag"><b>05</b> Interface</span>
                <div className="ui-top"><b>gn_</b><span><i></i><i></i><i></i></span></div>
                <div className="ui-h">Ship it.</div>
                <div className="ui-row">
                  <span className="ui-btn">Deploy</span>
                  <svg viewBox="0 0 120 36" className="ui-spark"><polyline points="0,30 18,24 34,27 52,14 70,18 88,7 104,11 120,3" /></svg>
                </div>
              </div>
            </div>
          </div>
          <div className="container xs-foot" id="xs-foot" aria-hidden="true"><span id="xs-cap">// scroll to take it apart</span></div>
        </div>
      </section>
  );
}

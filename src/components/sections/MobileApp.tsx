// Mobile: a real 3D phone (three.js). It spins in, tips back into an exploded view of its widget tree, the layers
// of an analytics app drop in one by one (status bar, app bar, metric, a live line chart with a gradient area,
// cards, top pages, nav bar), then everything snaps flat and the phone turns once to show it is real.

export function MobileApp() {
  return (
      <section id="mobile" className="mb" aria-label="A 3D phone assembles an analytics app layer by layer, then the layers snap together">
        <div className="mb-sticky">
          <canvas id="mb-gl" className="mb-gl" aria-hidden="true"></canvas>
          <div className="container mb-head">
            <h2 className="label" data-scramble>Mobile</h2>
            <p className="mb-title">Built pixel by pixel.<br /><span>Shipped to every pocket.</span></p>
          </div>
          <p className="sr-only">An analytics app on a phone: 12 480 total visitors in the last 7 days, up 18.2%, 38 920 page views, 32% bounce rate, an average visit of 2m 48s and 41% returning visitors.</p>
          <div className="container mb-foot" aria-hidden="true"><span className="mb-cap">// scroll to build</span></div>
        </div>
      </section>
  );
}

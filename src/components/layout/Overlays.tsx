export function Overlays() {
  return (
    <>
      <div className="progress" id="progress"></div>
      <div className="boot" id="boot" aria-hidden="true">
        <div className="boot-in">
          <span className="boot-mark">gn<i>_</i></span>
          <span className="boot-bar"><i id="boot-bar"></i></span>
          <span className="boot-meta"><em id="boot-txt">loading fonts</em><b id="boot-pct">0%</b></span>
        </div>
      </div>
    </>
  );
}

// Scroll "dissolve": the section you are leaving crumbles into particles, swirls as a galaxy and rebuilds as the next one.

export function Dissolve({ from, to }: { from: string; to: string }) {
  return (
      <div className="dz" data-from={from} data-to={to} aria-hidden="true">
        <div className="dz-sticky">
          <div className="dz-a"></div>
          <div className="dz-b"></div>
          <canvas></canvas>
        </div>
      </div>
  );
}

import certSantanderImg from "@/assets/cert-santander.jpg";
import certLinkedinImg from "@/assets/cert-linkedin.jpg";
import certCiberImg from "@/assets/cert-ciber.jpg";

// order = the order they hang along the corridor; the 3D gallery reads these buttons
const CERTS = [
  { k: "r2", img: certSantanderImg, title: "Project Management & Agile Fundamentals", issuer: "Santander Open Academy", date: "Aug 2024" },
  { k: "r4", img: certCiberImg, title: "Technical Principles of Cybersecurity", issuer: "UTAD · C-Academy", date: "Jan 2026" },
  { k: "r3", img: certLinkedinImg, title: "Managing and Leading Developers", issuer: "LinkedIn Learning", date: "Sep 2026" },
];

export function Certificates() {
  return (
      <section id="certificates" className="gal lp-next">
        <div className="gl-sticky">
          <canvas id="gl-cv" className="gl-cv" aria-hidden="true"></canvas>
          <div className="container gl-head">
            <h2 className="label" data-scramble>Certificates</h2>
            <p className="gl-title">The gallery.<br /><span>Walk in, the lights follow.</span></p>
          </div>
          <ul className="bs-list" id="bs-list">
            {CERTS.map((c) => (
              <li key={c.k}>
                <button type="button" className="bs-real" data-k={c.k} data-img={c.img} data-title={c.title} data-issuer={c.issuer} data-date={c.date}>{"Open certificate: " + c.title + ", " + c.issuer + ", " + c.date}</button>
              </li>
            ))}
          </ul>
          <div className="container gl-foot" aria-hidden="true"><span className="gl-cap" id="gl-cap">// scroll to walk in</span><span className="gl-count" id="gl-count">00 / 03</span></div>
          <div className="gl-box" id="gl-box" hidden>
            <img id="gl-img" alt="" />
            <button className="gl-close" id="gl-close" type="button" tabIndex={-1} aria-label="Close certificate">×</button>
            <span className="gl-boxcap" id="gl-boxcap"></span>
          </div>
        </div>
      </section>
  );
}

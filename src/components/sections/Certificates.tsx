import certNextumaImg from "@/assets/cert-nextuma.jpg";
import certSantanderImg from "@/assets/cert-santander.jpg";

export function Certificates() {
  return (
      <section id="certificates">
        <div className="container">
          <h2 className="label" data-scramble>Certificates</h2>
          <div className="cert-grid">
            <button className="cert-card" type="button" data-full="nextuma" data-reveal>
              <span className="cert-img"><img src={certNextumaImg} alt="Certificate: Workshop Vozes do Marketing" width={900} height={635} loading="lazy" /></span>
              <span className="cert-meta"><span>NextUMa</span><span>Nov 2025</span></span>
              <span className="cert-title">Workshop Vozes do Marketing</span>
            </button>
            <button className="cert-card" type="button" data-full="santander" data-reveal>
              <span className="cert-img"><img src={certSantanderImg} alt="Certificate: Project Management and Agile Fundamentals" width={900} height={562} loading="lazy" /></span>
              <span className="cert-meta"><span>Santander Open Academy</span><span>Aug 2024</span></span>
              <span className="cert-title">Project Management &amp; Agile Fundamentals</span>
            </button>
          </div>
        </div>
      </section>
  );
}

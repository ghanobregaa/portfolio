import type { CSSProperties } from "react";
import certNextumaImg from "@/assets/cert-nextuma.jpg";
import certSantanderImg from "@/assets/cert-santander.jpg";
import certLinkedinImg from "@/assets/cert-linkedin.jpg";
import certCiberImg from "@/assets/cert-ciber.jpg";

const v = (h: string, w: string) => ({ "--h": h, "--w": w }) as CSSProperties;

export function Certificates() {
  return (
      <section id="certificates">
        <div className="container">
          <h2 className="label" data-scramble>Certificates</h2>
          <p className="bs-title">On the shelf.<br /><span>Pick one to open it.</span></p>
          <div className="shelf" id="shelf">
            <div className="books">
              <span className="book deco t1" aria-hidden="true" style={v("74%", "28px")}></span>
              <button className="book real r2" type="button" data-img={certSantanderImg} data-title="Project Management & Agile Fundamentals" data-issuer="Santander Open Academy" data-date="Aug 2024"
                aria-label="Open certificate: Project Management and Agile Fundamentals, Santander Open Academy, August 2024" style={v("96%", "60px")}>
                <span className="sp-top">Santander</span><span className="sp-title">Agile &amp; PM</span><span className="sp-year">2024</span>
              </button>
              <span className="book deco t2" aria-hidden="true" style={v("82%", "22px")}></span>
              <button className="book real r1" type="button" data-img={certNextumaImg} data-title="Voices of Marketing Workshop" data-issuer="NextUMa" data-date="Nov 2025"
                aria-label="Open certificate: Voices of Marketing Workshop, NextUMa, November 2025" style={v("90%", "56px")}>
                <span className="sp-top">NextUMa</span><span className="sp-title">Voices of Marketing</span><span className="sp-year">2025</span>
              </button>
              <span className="book deco t3 lean" aria-hidden="true" style={v("78%", "24px")}></span>
              <button className="book real r4" type="button" data-img={certCiberImg} data-title="Technical Principles of Cybersecurity" data-issuer="UTAD · C-Academy" data-date="Jan 2026"
                aria-label="Open certificate: Technical Principles of Cybersecurity, University of Trás-os-Montes and Alto Douro, C-Academy, January 2026" style={v("100%", "62px")}>
                <span className="sp-top">UTAD</span><span className="sp-title">Cybersecurity</span><span className="sp-year">2026</span>
              </button>
              <button className="book real r3" type="button" data-img={certLinkedinImg} data-title="Managing and Leading Developers" data-issuer="LinkedIn Learning" data-date="Sep 2026"
                aria-label="Open certificate: Managing and Leading Developers, LinkedIn Learning, September 2026" style={v("88%", "56px")}>
                <span className="sp-top">LinkedIn</span><span className="sp-title">Leading Developers</span><span className="sp-year">2026</span>
              </button>
              <span className="book deco t2" aria-hidden="true" style={v("72%", "30px")}></span>
              <span className="bookend" aria-hidden="true"></span>
            </div>
            <div className="plank" aria-hidden="true"></div>
          </div>
        </div>
      </section>
  );
}

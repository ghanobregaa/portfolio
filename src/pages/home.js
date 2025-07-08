import React from "react";
import styles from "./styles.module.css";
import {
  HiArrowDownTray,
  HiBriefcase,
  HiCake,
  HiEnvelope,
  HiEye,
  HiMapPin,
} from "react-icons/hi2";
import Switch from "../components/Switch";
import { ReactComponent as Badge } from "../icons/badge.svg";

import { RiInstagramFill, RiLinkedinBoxFill } from "react-icons/ri";
import {
  TbArrowsDiagonal,
  TbBrandCss3,
  TbBrandFigma,
  TbBrandFlutter,
  TbBrandGithub,
  TbBrandHtml5,
  TbBrandInstagramFilled,
  TbBrandJavascript,
  TbBrandLinkedinFilled,
  TbBrandPython,
  TbBrandReact,
  TbBrandVscode,
  TbChevronDownRight,
  TbChevronUpRight,
  TbMailFilled,
} from "react-icons/tb";
import Meteor from "../components/Meteor";
export default function Home() {
  function getYearDifference(startDate, endDate) {
    // Calculate the difference in years
    let yearDiff = startDate.getFullYear() - endDate.getFullYear();

    // Check if we need to adjust for months and days
    if (
      startDate.getMonth() < endDate.getMonth() ||
      (startDate.getMonth() === endDate.getMonth() &&
        startDate.getDate() < endDate.getDate())
    ) {
      yearDiff--;
    }

    return yearDiff;
  }
  const startDate = new Date();
  const birthday = new Date("1999-12-04");
  const start_work = new Date("2021-03-01");
  const age = getYearDifference(startDate, birthday);
  const work = getYearDifference(startDate, start_work);
  return (
    <>
      <div className={styles.container}>
        <nav className={styles.nav}>
          <div className={styles.separ}>
            <span></span>
            <p>GN</p>
            <span></span>
          </div>
          <Switch />
        </nav>
        <header className={styles.header}>
          <div className={styles.banner}>
            <Meteor />
          </div>
          <div className={styles.rowCv}>
            <div className={styles.avatar}>
              <img src="Profile.jpeg" alt="Avatar" />
            </div>
            <a className={styles.cv} href="Guilherme_Nobrega.pdf">
              Download CV
            </a>
          </div>

          <div className={styles.content}>
            <div className={styles.name}>
              <p>Guilherme Nóbrega</p>
              <Badge />
            </div>
            <p className={styles.desc}>
              Transforming ideas into seamless code and innovative solutions,
              one line at a time. 🚀
            </p>
            <div className={styles.rowContents}>
              <span className={styles.rowDesc}>
                <HiBriefcase />
                <p>Working</p>
              </span>
              <span className={styles.rowDesc}>
                <HiMapPin />
                <p>Madeira Island</p>
              </span>
              <span className={styles.rowDesc}>
                <HiCake />
                <p>December, 1999</p>
              </span>
            </div>
          </div>
          <div className={styles.rowIcons}>
            <a
              className={`${styles.rowIcon} ${styles.mail}`}
              target="_blank"
              href="mailto:ghanobrega@gmail.com"
            >
              <TbMailFilled />
              Email
            </a>
            <a
              className={styles.rowIcon}
              target="_blank"
              href="https://www.linkedin.com/in/ghanobrega"
            >
              <TbBrandLinkedinFilled />
              LinkedIn
            </a>
            <a
              className={styles.rowIcon}
              target="_blank"
              href="https://www.instagram.com/ghanobrega"
            >
              <TbBrandInstagramFilled />
              Instagram
            </a>
          </div>
        </header>
        <main className={styles.main}>
          <div className={styles.columnMain}>
            <div className={styles.centerTitle} style={{ marginTop: "7em" }}>
              <h1>About</h1>
              <h1>Me</h1>
            </div>
            <div className={styles.simpTextBox}>
              <p className={styles.simpText}>
                <b>Yooo! 🤙</b>
                <br />
                I'm a <span className={styles.subb}>full-stack developer </span>
                based on Madeira Island,{" "}
                <span className={styles.subb}>{age} years old </span>
                and passionate about designing and building impactful digital
                solutions.
              </p>
              <br />
              <p className={styles.simpText}>
                With expertise in both{" "}
                <span className={styles.subb}>front-end </span>and{" "}
                <span className={styles.subb}>back-end </span>
                development, I transform innovative ideas into seamless,
                user-centric applications that prioritize performance,
                scalability, and intuitive design.
              </p>
              <br />
              <p className={styles.simpText}>
                My mission is to deliver high-quality, robust solutions that
                elevate user experiences and drive meaningful results.
              </p>
            </div>
            <div className={styles.centerTitle} style={{ marginTop: "7em" }}>
              <h1>{work} years of</h1>
              <h1>Experience</h1>
            </div>
            <div className={styles.columnWork}>
              <a
                className={styles.boxWork}
                target="_blank"
                href="https://www.afa.pt"
              >
                <p className={styles.workTitle}>Grupo AFA</p>
                <p className={styles.contentWork}>
                  After the IT departments of Savoy Signature and Grupo AFA
                  merged, I built a Flutter mobile app for the collaborators
                  portal, created a Python script to automate hotel
                  reservations, and developed an internal helpdesk ticketing
                  system using ReactJS to improve staff communication,
                  efficiency, and support management.
                </p>
                <p className={styles.contentWork}>Sep 2022 - Present</p>
                <div className={styles.arrow}>
                  <TbChevronUpRight size={20} />
                </div>
              </a>
              <a
                className={styles.boxWork}
                target="_blank"
                href="https://www.savoysignature.com"
              >
                <p className={styles.workTitle}>Savoy Signature</p>
                <p className={styles.contentWork}>
                  Developed mobile applications with Flutter and websites using
                  ReactJS, integrating REST APIs for seamless functionality.
                  <br />
                  <br />
                  This included designing and building a mobile app for the
                  hotel’s maintenance team to streamline task management and
                  issue tracking, as well as creating a collaborators portal to
                  improve internal communication and coordination among staff.
                </p>
                <p className={styles.contentWork}>Mar 2021 - Sep 2022</p>
                <div className={styles.arrow}>
                  <TbChevronUpRight size={20} />
                </div>
              </a>
            </div>
            <div className={styles.centerTitle} style={{ marginTop: "7em" }}>
              <h1>Development</h1>
              <h1>Tools</h1>
            </div>
            <div className={styles.columnSkills}>
              <div className={styles.rowSkills}>
                <div className={styles.iconSkills}>
                  <TbBrandReact />
                </div>
                <div className={styles.columnSkillsNames}>
                  <p>ReactJS</p>
                  <p>JavaScript Framework</p>
                </div>
              </div>
              <div className={styles.rowSkills}>
                <div className={styles.iconSkills}>
                  <TbBrandFlutter />
                </div>
                <div className={styles.columnSkillsNames}>
                  <p>Flutter</p>
                  <p>Cross-platform Mobile Framework</p>
                </div>
              </div>
              <div className={styles.rowSkills}>
                <div className={styles.iconSkills}>
                  <TbBrandJavascript />
                </div>
                <div className={styles.columnSkillsNames}>
                  <p>JavaScript</p>
                  <p>Front-end Programming Language</p>
                </div>
              </div>
              <div className={styles.rowSkills}>
                <div className={styles.iconSkills}>
                  <TbBrandHtml5 />
                </div>
                <div className={styles.columnSkillsNames}>
                  <p>HTML</p>
                  <p>Hypertext Markup Language</p>
                </div>
              </div>
              <div className={styles.rowSkills}>
                <div className={styles.iconSkills}>
                  <TbBrandCss3 />
                </div>
                <div className={styles.columnSkillsNames}>
                  <p>CSS</p>
                  <p>Cascading Style Sheets</p>
                </div>
              </div>
              <div className={styles.rowSkills}>
                <div className={styles.iconSkills}>
                  <TbBrandPython />
                </div>
                <div className={styles.columnSkillsNames}>
                  <p>Python</p>
                  <p>Back-end Programming Language</p>
                </div>
              </div>
              <div className={styles.rowSkills}>
                <div className={styles.iconSkills}>
                  <TbBrandFigma />
                </div>
                <div className={styles.columnSkillsNames}>
                  <p>Figma</p>
                  <p>Graphic Design and Prototyping</p>
                </div>
              </div>
              <div className={styles.rowSkills}>
                <div className={styles.iconSkills}>
                  <TbBrandVscode />
                </div>
                <div className={styles.columnSkillsNames}>
                  <p>Visual Studio Code</p>
                  <p>Source Code Editor</p>
                </div>
              </div>
              <div className={styles.rowSkills}>
                <div className={styles.iconSkills}>
                  <TbBrandGithub />
                </div>
                <div className={styles.columnSkillsNames}>
                  <p>GitHub</p>
                  <p>Version Control System</p>
                </div>
              </div>
            </div>
          </div>
        </main>
        <footer className={styles.footer}>
          <p>
            <p className={styles.footerContent}>
              © {new Date().getFullYear()} Handcrafted with ❤️ by{" "}
              <a
                className={styles.aFooter}
                href="https://ghanobregaa.github.io/portfolio/"
              >
                GN
              </a>
            </p>
          </p>
        </footer>
      </div>
    </>
  );
}

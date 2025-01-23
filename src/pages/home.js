import React from "react";
import styles from "./styles.module.css";
import {
  HiArrowDownTray,
  HiBriefcase,
  HiCake,
  HiEye,
  HiMapPin,
} from "react-icons/hi2";
import Switch from "../components/Switch";
import { ReactComponent as Badge } from "../icons/badge.svg";

import { RiInstagramFill, RiLinkedinBoxFill } from "react-icons/ri";

export default function Home() {
  return (
    <>
      <div className={styles.container}>
        <nav className={styles.nav}>
          <h1>PORTFOLIO</h1>
          <Switch />
        </nav>
        <header className={styles.header}>
          <div className={styles.banner}></div>
          <div className={styles.rowCv}>
            <div className={styles.avatar}>
              <img src="Profile.jpeg" alt="Avatar" />
            </div>
            <p className={styles.cv}>Download CV</p>
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
              className={styles.rowIcon}
              target="_blank"
              href="https://www.linkedin.com/in/ghanobrega"
            >
              <RiLinkedinBoxFill />
              <p>ghanobrega</p>
            </a>
            <a
              className={styles.rowIcon}
              target="_blank"
              href="https://www.instagram.com/guilhermehan_"
            >
              <RiInstagramFill />
              <p>guilhermehan_</p>
            </a>
          </div>
        </header>
        <main className={styles.main}>
          <div className={styles.columnMain}>
            <div className={styles.centerTitle}>
              <h1>About</h1>
              <h1>Guilherme</h1>
            </div>
            <div className={styles.simpTextBox}>
              <p className={styles.simpText}>
                <b>Yooo! 🤙</b>
                <br />
                I’m a software developer based on Madeira Island, passionate
                about crafting <span className={styles.subb}>
                  beautiful
                </span>{" "}
                and intuitive applications.
              </p>
              <br />
              <p className={styles.simpText}>
                {" "}
                I turn ideas into seamless digital experiences with
                user-friendly designs and robust solutions, always aiming for
                high-quality results.
              </p>
            </div>
            <div className={styles.centerTitle}>
              <h1>3 years of</h1>
              <h1>Experience</h1>
            </div>
            <div className={styles.columnWork}>
              <div className={styles.boxWork}>
                <p className={styles.workTitle}>Grupo AFA</p>
                <p className={styles.contentWork}>
                  Developed mobile applications with Flutter and websites using
                  ReactJS, integrating REST APIs for seamless functionality.
                </p>
                <p className={styles.contentWork}>Mar 2021 - Present</p>
              </div>
            </div>
            <div className={styles.centerTitle}>
              <h1>Skills</h1>
              <h1>Unlocked</h1>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

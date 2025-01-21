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
          <div className={styles.banner}>
            <div className={styles.blob}></div>
            <div className={styles.blob}></div>
            <div className={styles.blob}></div>
            <div className={styles.blob}></div>
          </div>
          <div className={styles.rowCv}>
            <div className={styles.avatar}>
              <img src="Profile.jpeg" alt="Avatar" />
            </div>
            <p className={styles.cv}>
              <HiEye size={16} />
              Watch CV
            </p>
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
                <HiBriefcase size={18} />
                <p>Working</p>
              </span>
              <span className={styles.rowDesc}>
                <HiMapPin size={18} />
                <p>Madeira Island</p>
              </span>
              <span className={styles.rowDesc}>
                <HiCake size={18} />
                <p>December 4th</p>
              </span>
            </div>
          </div>
          <div className={styles.rowIcons}>
            <a
              className={styles.rowIcon}
              target="_blank"
              href="https://www.linkedin.com/in/ghanobrega"
            >
              <RiLinkedinBoxFill size={18} />
              <p>ghanobrega</p>
            </a>
            <a
              className={styles.rowIcon}
              target="_blank"
              href="https://www.instagram.com/guilhermehan_"
            >
              <RiInstagramFill size={18} />
              <p>guilhermehan_</p>
            </a>
          </div>
        </header>
        <main className={styles.main}>
          <div className={styles.centerMain}>
            <h1>Software</h1>
            <h1>Developer</h1>
          </div>
        </main>
      </div>
    </>
  );
}

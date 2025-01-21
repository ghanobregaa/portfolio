import React from "react";
import styles from "./styles.module.css";
import { HiArrowDownTray, HiEye } from "react-icons/hi2";
import Switch from "../components/Switch";

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
              <img src="Picture.jpeg" alt="Avatar" />
            </div>
            <p className={styles.cv}>
              <HiArrowDownTray size={20} />
              Download CV
            </p>
          </div>
          <div className={styles.content}>
            <p className={styles.name}>Guilherme Nóbrega</p>
          </div>
        </header>
        <main className={styles.main}></main>
      </div>
    </>
  );
}

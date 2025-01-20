import React from "react";
import styles from "./styles.module.css";
import Switch from "../components/Switch";
import { HiCake, HiMapPin } from "react-icons/hi2";

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.nav}>
        <div className={styles.navContainer}>
          <h1>Portfolio</h1>
        </div>
      </div>
      <div className={styles.banner}>
        <div className={styles.rowContent}>
          <div className={styles.avatar}>
            <img src="Profile.jpeg" alt="Avatar" />
          </div>
        </div>
      </div>
      <div className={styles.rowName}>
        <Switch />
        <p className={styles.cv}>Download CV</p>
      </div>
      <div className={styles.profileContent}>
        <p className={styles.name}>Guilherme Nóbrega</p>
        <span className={styles.cRow}>
          <HiMapPin size={16} /> <p>Madeira Island</p>
        </span>
        <span className={styles.cRow}>
          <HiCake size={16} /> <p>December, 1999</p>
        </span>
      </div>
    </div>
  );
}

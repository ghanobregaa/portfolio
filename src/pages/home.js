import React from "react";
import styles from "./styles.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <div className={styles.card}>
          <div className={styles.picture}>
            <img src="Profile.jpeg" />
          </div>
        </div>
        <div className={`${styles.column} ${styles.title}`}>
          <span>Software</span>
          <span>Developer</span>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import styles from "./styles.module.css";
import { ReactComponent as HomeSvg } from "../icons/home_white.svg";
import { ReactComponent as FileSvg } from "../icons/file_white.svg";
import { ReactComponent as WrenchSvg } from "../icons/wrench_white.svg";
import { ReactComponent as WorkSvg } from "../icons/work_white.svg";

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.banner}>
        <div className={styles.centerAvatar}>
          <div className={styles.avatar}>
            <img src="Picture.jpeg" />
          </div>
        </div>
      </div>
      <div className={styles.rowContent}>
        <div className={styles.btnWatch}>Download CV</div>
      </div>
    </div>
  );
}

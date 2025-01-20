import React, { useState } from "react";
import { HiMoon, HiSun } from "react-icons/hi2";
import styles from "./Switch.module.css";

export default function Switch() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") ?? "light");
  function handleClick() {
    const rootElement = document.documentElement;
    if (theme === "light") {
      setTheme("dark");
      rootElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      setTheme("light");
      rootElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    }
  }
  return (
    <div onClick={handleClick} className={styles.btn}>
      {theme === "light" ? <HiMoon size={24} /> : <HiSun size={24} />}
    </div>
  );
}

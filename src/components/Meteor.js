import React from "react";
import styles from "./Meteor.module.css";

export default function Meteor() {
  return (
    <div className={styles.container}>
      {Array.from({ length: 20 }).map((_, index) => (
        <div
          key={index}
          className={styles.meteor}
          style={{
            left: `${-30 + index * 10}%`,
            animationDelay: `${Math.random() * index}s`,
            animationDuration: `${(Math.random() * (1 - 0.5) + 0.5) * 12}s`,
            animationComposition: "replace",
          }}
        ></div>
      ))}
    </div>
  );
}

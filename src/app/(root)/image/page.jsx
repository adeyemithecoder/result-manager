"use client";
import Image from "next/image";
import styles from "./image.module.css"; // Adjust the import path accordingly

const YourComponent = () => {
  return (
    <div className={styles.container}>
      <h1>welocom to homw page</h1>
      <div className={styles.contents}>
        <div className={styles.imageContainer}>
          <Image src='/img/result.jpg' alt='img3' fill />
        </div>
        <h3>this is image one </h3>
      </div>
      <div className={styles.contents}>
        <div className={styles.imageContainer}>
          <Image src='/img/stu1.jpg' alt='img2' fill />
        </div>
        <h3>this is image two </h3>
      </div>
      <div className={styles.contents}>
        <div className={styles.imageContainer}>
          <Image src='/img/stu2.jpg' alt='img3' fill />
        </div>
        <h3>this is image three </h3>
      </div>
      <div className={styles.contents}>
        <div className={styles.imageContainer}>
          <Image src='/img/stu4.jpg' alt='img4' fill />
        </div>
        <h3>this is image four </h3>
      </div>
      <div className={styles.contents}>
        <div className={styles.imageContainer}>
          <Image src='/img/stu5.jpg' alt='img5' fill />
        </div>
        <h3>this is image five </h3>
      </div>
      <div className={styles.contents}>
        <div className={styles.imageContainer}>
          <Image src='/img/t1.jpg' alt='six' fill />
        </div>
        <h3>this is image six </h3>
      </div>
    </div>
  );
};

export default YourComponent;

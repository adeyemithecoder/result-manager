"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import styles from "./page.module.css";
import { MdFamilyRestroom } from "react-icons/md";
import { FaUsers } from "react-icons/fa";

export default function Home() {
  const searchParams = useSearchParams();
  const source = searchParams.get("source") || "Direct Access";
  return (
    <main className={styles.main}>
      <div className={styles.overlay}>
        {/* <h1>You are visiting from: {source}</h1> */}

        <h1>
          Welcome to{" "}
          {source === "Direct Access" ? "As Code Elevate Solution's" : source}{" "}
          Result Manager! Streamline your {"school's"} results and attendance
          with ease and accuracy.
        </h1>

        <div className={styles.boxContainer}>
          <div className={styles.box}>
            <div className={styles.iconContainer}>
              <FaUsers className={styles.icon} />
            </div>
            <div className={styles.text}>
              <Link className={styles.link} href="/login">
                <h3>USERS</h3>
                <p>Login</p>
              </Link>
            </div>
          </div>

          <div className={styles.box}>
            <div className={styles.iconContainer}>
              <MdFamilyRestroom className={styles.icon} />
            </div>
            <div className={styles.text}>
              <Link className={styles.link} href="/student/login">
                <h3>Students</h3>
                <p>Login</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

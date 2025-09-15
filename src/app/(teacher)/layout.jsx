import styles from "./page.module.css";
import Navbar from "./navbar/navbar";
export default async function RootLayout({ children }) {
  return (
    <div className={styles.layout}>
      <div className={styles.navbar}>
        <Navbar />{" "}
      </div>
      <div className={styles.allChild}>{children}</div>
    </div>
  );
}

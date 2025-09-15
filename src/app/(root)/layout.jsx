import styles from "./page.module.css";
export default async function RootLayout({ children }) {
  return (
    <div className={styles.layout}>
      <div>{children}</div>
    </div>
  );
}

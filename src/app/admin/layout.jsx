import Sidebar from "@/components/admin/sidebar/sidebar";
import styles from "./page.module.css";
import Navbar from "@/components/admin/Navbar/Navbar";
import { ContextProvider } from "@/components/context/Context";

export default async function RootLayout({ children }) {
  return (
    <div className={styles.container}>
      <ContextProvider>
        <Navbar />
        <div className={styles.layout}>
          <div className={styles.sideBar}>
            <Sidebar />{" "}
          </div>
          <div className={styles.allChild}>{children}</div>
        </div>
      </ContextProvider>
    </div>
  );
}

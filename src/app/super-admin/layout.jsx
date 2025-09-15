import SupeerAdminSidebar from "@/components/superAdminadmin/superAdminSidebar/sidebar";
import styles from "./page.module.css";
import { ContextProvider } from "@/components/context/Context";
import SuperAdminNavbar from "@/components/superAdminadmin/superAdminNavbar/Navbar";

export default async function RootLayout({ children }) {
  return (
    <div className={styles.container}>
      <ContextProvider>
        <SuperAdminNavbar />
        <div className={styles.layout}>
          <div className={styles.sideBar}>
            <SupeerAdminSidebar />
          </div>
          <div className={styles.allChild}>{children}</div>
        </div>
      </ContextProvider>
    </div>
  );
}

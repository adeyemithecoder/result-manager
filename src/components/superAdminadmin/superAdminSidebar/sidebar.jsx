"use client";
import { usePathname } from "next/navigation";
import styles from "./sidebar.module.css";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import {
  MdFamilyRestroom,
  MdExpandMore,
  MdExpandLess,
  MdAddHomeWork,
} from "react-icons/md";
import { FaSchool, FaUserInjured } from "react-icons/fa";
import { IoMdPersonAdd } from "react-icons/io";
import { MdAssignmentTurnedIn } from "react-icons/md";
import { IoDocumentsSharp, IoHome, IoPersonAddSharp } from "react-icons/io5";
import { RiDashboard2Line } from "react-icons/ri";
import { signOut, useSession } from "next-auth/react";
import { FaRegRegistered } from "react-icons/fa6";
import { GrSchedule, GrUserAdmin } from "react-icons/gr";
import { BsBuilding, BsGear, BsKey } from "react-icons/bs"; // New icons for school and system settings
import { Context } from "@/components/context/Context";

const SupeerAdminSidebar = () => {
  const pathname = usePathname();
  const [schoolsDropdownOpen, setSchoolsDropdownOpen] = useState(false);
  const { data: session, status: sessionStatus } = useSession();
  const [mounted, setMounted] = useState(false);
  const { sidebarOpen, dispatch } = useContext(Context);
  useEffect(() => {
    if (sessionStatus === "authenticated") {
      if (session.role !== "SUPER_ADMIN") {
        signOut();
        redirect("/");
      } else {
        setMounted(true);
      }
    }
  }, [sessionStatus, session]);
  useEffect(() => {
    const storedSidebarOpen = localStorage.getItem("sidebarOpen") === "true";
    if (storedSidebarOpen !== sidebarOpen) {
      dispatch({ type: "TOGGLE_SIDEBAR" });
    }
  }, []);

  const closeSidebar = () => {
    if (sidebarOpen) {
      dispatch({ type: "TOGGLE_SIDEBAR" });
    }
  };

  const toggleSchoolsDropdown = () => {
    setSchoolsDropdownOpen(!schoolsDropdownOpen);
  };

  if (!mounted) return <h1></h1>;

  return (
    <div className={styles.sidebarContainer}>
      <div className={`${styles.container} ${sidebarOpen ? styles.open : ""}`}>
        <section className={styles.listContainer}>
          <li onClick={closeSidebar}>
            <Link
              className={`${styles.nav} ${
                pathname === "/super-admin" ? styles.active : ""
              }`}
              href={"/super-admin"}
            >
              <RiDashboard2Line className={styles.icon} />
              <span>Dashboard</span>
            </Link>
          </li>
          {session.role === "SUPER_ADMIN" && (
            <>
              <li onClick={closeSidebar}>
                <Link
                  className={`${styles.nav} ${
                    pathname === "/super-admin/all-admin" ? styles.active : ""
                  }`}
                  href="/super-admin/all-admin"
                >
                  <GrUserAdmin className={styles.icon} />
                  <span>All admin</span>
                </Link>
              </li>
              <li onClick={closeSidebar}>
                <Link
                  className={`${styles.nav} ${
                    pathname === "/super-admin/schools" ? styles.active : ""
                  }`}
                  href="/super-admin/schools"
                >
                  <FaSchool className={styles.icon} />
                  <span>All Schools</span>
                </Link>
              </li>
              <li onClick={closeSidebar}>
                <Link
                  className={`${styles.nav} ${
                    pathname === "/super-admin/add-school" ? styles.active : ""
                  }`}
                  href="/super-admin/add-school"
                >
                  <MdAddHomeWork className={styles.icon} />
                  <span>Add new school</span>
                </Link>
              </li>
              <li onClick={closeSidebar}>
                <Link
                  className={`${styles.nav} ${
                    pathname === "/super-admin/new-class" ? styles.active : ""
                  }`}
                  href="/super-admin/new-class"
                >
                  <IoPersonAddSharp className={styles.icon} />
                  <span>Add Classes</span>
                </Link>
              </li>
              <li onClick={closeSidebar}>
                <Link
                  className={`${styles.nav} ${
                    pathname === "/super-admin/register" ? styles.active : ""
                  }`}
                  href="/super-admin/register"
                >
                  <IoPersonAddSharp className={styles.icon} />
                  <span>Add new admin</span>
                </Link>
              </li>
              <li onClick={closeSidebar}>
                <Link
                  className={`${styles.nav} ${
                    pathname === "/super-admin/credential" ? styles.active : ""
                  }`}
                  href="/super-admin/credential"
                >
                  <BsKey className={styles.icon} />
                  <span>Student Credential</span>
                </Link>
              </li>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default SupeerAdminSidebar;

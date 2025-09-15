"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import styles from "./navbar.module.css";
import {
  FaCaretDown,
  FaCaretUp,
  FaPowerOff,
  FaRegEdit,
  FaTimes,
} from "react-icons/fa";
import { IoCloudUploadOutline, IoMenuSharp } from "react-icons/io5";
import { RiRegisteredFill } from "react-icons/ri";
import { MdAddTask, MdOutlinePreview } from "react-icons/md";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import axios from "axios";
import { SiLevelsdotfyi } from "react-icons/si";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [school, setSchool] = useState([]);
  const pathname = usePathname();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { data: session, status: sessionStatus } = useSession();
  const logOut = async () => {
    if (!window.confirm("Are you sure you want to log out?")) return;
    await signOut({ callbackUrl: "/" });
  };

  const handleNavigation = (event, path) => {
    event.preventDefault();
    router.push(path);
    setOpen(false);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };
  useEffect(() => {
    const fetchSchoolData = async () => {
      if (!session) return;
      try {
        const { data } = await axios.get(`/api/school/${session.schoolId}`);
        setSchool(data);
      } catch (error) {
        console.error("Error fetching school data:", error);
      }
    };
    fetchSchoolData();
  }, [session]);
  const hideNavbar = pathname.includes("/print/");

  return (
    <>
      {!hideNavbar && (
        <nav className={styles.navbar}>
          {open && (
            <div
              className={styles.sidebarOverlay}
              onClick={() => setOpen(false)}
            ></div>
          )}

          <div className={styles.logo}>
            <div className={styles.imageContainer}>
              <Image
                src={school.logo || "/img/logo.jpeg"}
                alt="img2"
                height={60}
                width={70}
              />
            </div>
            <span> {school.name?.toUpperCase()}</span>
          </div>

          {/* Sidebar menu */}
          <div className={`${styles.hamburger} ${open ? styles.visible : ""}`}>
            <div className={styles.menuGroup}>
              <div className={styles.cancelBtn} onClick={() => setOpen(false)}>
                <FaTimes />
              </div>
              <li onClick={(event) => handleNavigation(event, "/check-result")}>
                <Link
                  href="/check-result"
                  className={`${styles.nav} ${
                    pathname === "/check-result" ? styles.active : ""
                  }`}
                >
                  <IoCloudUploadOutline className={styles.icon} />
                  <span>Result</span>
                </Link>
              </li>
              <li onClick={(event) => handleNavigation(event, "/attendance")}>
                <Link
                  href="/attendance"
                  className={`${styles.nav} ${
                    pathname === "/attendance" ? styles.active : ""
                  }`}
                >
                  <RiRegisteredFill className={styles.icon} />
                  <span>Attendance</span>
                </Link>
              </li>
              <li onClick={(event) => handleNavigation(event, "/comment")}>
                <Link
                  href="/comment"
                  className={`${styles.nav} ${
                    pathname === "/comment" ? styles.active : ""
                  }`}
                >
                  <FaRegEdit className={styles.icon} />
                  <span>Comment</span>
                </Link>
              </li>
              <li onClick={(event) => handleNavigation(event, "/task")}>
                <Link
                  href="/task"
                  className={`${styles.nav} ${
                    pathname === "/task" ? styles.active : ""
                  }`}
                >
                  <MdAddTask className={styles.icon} />
                  <span>Task</span>
                </Link>
              </li>
              <li
                onClick={(event) =>
                  handleNavigation(event, "/student-performance")
                }
              >
                <Link
                  href="/student-performance"
                  className={`${styles.nav} ${
                    pathname === "/student-performance" ? styles.active : ""
                  }`}
                >
                  <SiLevelsdotfyi className={styles.icon} />
                  <span>Student Performance</span>
                </Link>
              </li>
              <li onClick={(event) => handleNavigation(event, "/review")}>
                <Link
                  href="/review"
                  className={`${styles.nav} ${
                    pathname === "/review" ? styles.active : ""
                  }`}
                >
                  <MdOutlinePreview className={styles.icon} />
                  <span>Review Result</span>
                </Link>
              </li>
            </div>
          </div>

          <div className={styles.middleBar}>
            <div className={styles.adminContainer}>
              <div className={styles.desktop}>
                <span>TEACHER: {session?.name.toUpperCase()} </span>
                <div className={styles.imageContainer}>
                  <Image
                    className={styles.img}
                    src={session?.imageUrl || "/img/admin.jpg"}
                    alt="img2"
                    height={60}
                    width={60}
                  />
                  <button onClick={logOut} className={styles.logoutButton}>
                    <FaPowerOff className={styles.icon} />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
              <button
                onClick={toggleDropdown}
                className={styles.dropdownButton}
              >
                {dropdownOpen ? (
                  <FaCaretUp className={styles.icon} fontSize={35} />
                ) : (
                  <FaCaretDown className={styles.icon} fontSize={35} />
                )}
              </button>
              {dropdownOpen && (
                <div className={styles.dropdownMenu}>
                  <div className={styles.dropdownItem}>
                    <Image
                      className={styles.img}
                      src={session?.imageUrl || "/img/admin.jpg"}
                      alt="img2"
                      height={60}
                      width={60}
                    />
                    <span>{session?.name.toUpperCase()}</span>
                  </div>
                  <button onClick={logOut} className={styles.logoutButton}>
                    <FaPowerOff className={styles.icon} />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* Right column with menu button */}
          <div className={styles.rightColumn}>
            <div className={styles.menuBtn} onClick={() => setOpen(true)}>
              <IoMenuSharp className={styles.icon} />
            </div>
          </div>
        </nav>
      )}
    </>
  );
};

export default Navbar;

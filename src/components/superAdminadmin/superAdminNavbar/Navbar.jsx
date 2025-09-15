"use client";
import React, { useEffect, useState, useContext } from "react";
import styles from "./Navbar.module.css";
import Image from "next/image";
import { FaCaretUp, FaPowerOff } from "react-icons/fa";
import { signOut, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { FaCaretDown } from "react-icons/fa";
import { Context } from "@/components/context/Context";
import { IoMdClose } from "react-icons/io";
import { MdOutlineMenu } from "react-icons/md";

const SuperAdminNavbar = () => {
  const { data: session, status: sessionStatus } = useSession();
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { sidebarOpen, dispatch } = useContext(Context);
  useEffect(() => {
    if (sessionStatus === "authenticated") {
      if (session.role === "USER") {
        signOut();
        redirect("/");
      } else {
        setMounted(true);
      }
    }
  }, [sessionStatus, session]);

  const logOut = async () => {
    if (!window.confirm("Are you sure to log out?")) return;
    await signOut({ callbackUrl: "/" });
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const toggleSidebar = () => {
    dispatch({ type: "TOGGLE_SIDEBAR" });
  };

  if (!mounted) return <p></p>;

  return (
    <div className={styles.container}>
      <div className={styles.leftbar}>
        <div className={styles.imageContainer}>
          <Image src="/img/logo.png" alt="img2" height={50} width={60} />
        </div>
        <span>As Code Elevate</span>
      </div>
      <div className={styles.middlebar}> </div>
      <div className={styles.rightbar}>
        <div className={styles.rightbarDiv}>
          <div className={styles.adminContainer}>
            <span>
              {session?.role} {session?.username.toUpperCase()}{" "}
            </span>
            <div className={styles.imageContainer}>
              <Image
                className={styles.img}
                src={session?.imageUrl || "/img/admin.jpg"}
                alt="img2"
                height={50}
                width={50}
              />
            </div>
            <button
              onClick={() => {
                logOut();
              }}
            >
              <FaPowerOff className={styles.icon} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>

      <div className={styles.mobile}>
        <button onClick={toggleSidebar} className={styles.hamburger}>
          {sidebarOpen ? (
            <IoMdClose fontSize={35} />
          ) : (
            <MdOutlineMenu fontSize={35} />
          )}
        </button>
        <button onClick={toggleDropdown} className={styles.dropdownButton}>
          {dropdownOpen ? (
            <FaCaretUp fontSize={35} />
          ) : (
            <FaCaretDown fontSize={35} />
          )}
        </button>
        {dropdownOpen && (
          <div className={styles.dropdownMenu}>
            <div className={styles.dropdownItem}>
              <Image
                className={styles.img}
                src={session?.imageUrl || "/img/admin.jpg"}
                alt="img2"
                height={50}
                width={50}
              />
              <span>{session?.username}</span>
            </div>
            <button
              onClick={() => {
                logOut();
              }}
              className={styles.logoutButton}
            >
              <FaPowerOff className={styles.icon} />
              <span>Log Out</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminNavbar;

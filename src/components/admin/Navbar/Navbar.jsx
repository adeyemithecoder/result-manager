"use client";
import React, { useEffect, useState, useContext } from "react";
import styles from "./Navbar.module.css";
import Image from "next/image";
import { FaPowerOff } from "react-icons/fa";
import { signOut, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { FaCaretDown, FaCaretUp } from "react-icons/fa"; // Import FaCaretUp
import { Context } from "@/components/context/Context";
import { IoMdClose } from "react-icons/io";
import { MdOutlineMenu } from "react-icons/md";
import axios from "axios";

const Navbar = () => {
  const { data: session, status: sessionStatus } = useSession();
  const [school, setSchool] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { sidebarOpen, dispatch } = useContext(Context);

  useEffect(() => {
    const fetchSchoolData = async () => {
      try {
        const { data } = await axios.get(`/api/school/${session.schoolId}`);
        setSchool(data);
      } catch (error) {
        console.error("Error fetching school data:", error);
      }
    };
    fetchSchoolData();
  }, [session]);

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

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      if (session.role !== "ADMIN") {
        signOut();
        redirect("/");
      }
    }
  }, [sessionStatus, session]);
  if (sessionStatus == "loading") return <h1></h1>;
  if (sessionStatus !== "authenticated") redirect("/");

  return (
    <div className={styles.container}>
      <div className={styles.leftbar}>
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
      <div className={styles.middlebar}> </div>
      <div className={styles.rightbar}>
        <div className={styles.rightbarDiv}>
          <div className={styles.adminContainer}>
            <span>
              {session?.role} {session?.name?.toUpperCase()}{" "}
            </span>
            <div className={styles.imageContainer}>
              <Image
                className={styles.img}
                src={session?.imageUrl || "/img/admin.jpg"}
                alt="img2"
                height={60}
                width={60}
              />
            </div>
            <button onClick={logOut}>
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
              <span>{session?.name}</span>
            </div>
            <button onClick={logOut} className={styles.logoutButton}>
              <FaPowerOff className={styles.icon} />
              <span>Log Out</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;

"use client";
import { PiUsersFourFill } from "react-icons/pi";
import styles from "./admin.module.css";
import { FaUserInjured } from "react-icons/fa";
import { MdFamilyRestroom } from "react-icons/md";
import { RiDashboard2Line } from "react-icons/ri";
import { ImUserCheck } from "react-icons/im";
import { signOut, useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import GenderPieChart from "@/components/GenderChart";

const Admin = () => {
  const { data: session, status: sessionStatus } = useSession();
  const [count, setCount] = useState({});

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      if (session.role !== "ADMIN") {
        signOut();
        redirect("/");
      } else {
        const fetchCount = async () => {
          try {
            const { data } = await axios.get(
              `/api/student/count/${session.schoolId}`
            );
            setCount(data);
          } catch (error) {
            console.error("Failed to fetch data:", error);
          }
        };
        fetchCount();
      }
    }
  }, [sessionStatus, session]);

  if (sessionStatus === "loading") return <h1>Please wait...</h1>;
  if (sessionStatus !== "authenticated") redirect("/");

  return (
    <div className={styles.container}>
      <div className={styles.boxContainer}>
        <div className={styles.box}>
          <div className={styles.iconContainer}>
            <MdFamilyRestroom className={styles.icon} />
          </div>
          <div className={styles.text}>
            <Link className={styles.link} href="/admin/primary">
              <p>Primary Students</p>
              <h4>{count?.primaryStudents} </h4>
            </Link>
          </div>
        </div>
        <div className={styles.box}>
          <div className={styles.iconContainer}>
            <PiUsersFourFill className={styles.icon} />
          </div>
          <div className={styles.text}>
            <Link className={styles.link} href="/admin/secondary">
              <p>Secondary Students</p>
              <h4>{count?.secondaryStudents} </h4>
            </Link>
          </div>
        </div>
        <div className={styles.box}>
          <div className={styles.iconContainer}>
            <ImUserCheck className={styles.icon} />
          </div>
          <div className={styles.text}>
            <Link className={styles.link} href="/admin/secondary">
              <p>Total Students</p>
              <h4>{count?.totalStudents} </h4>
            </Link>
          </div>
        </div>
        <div className={styles.box}>
          <div className={styles.iconContainer}>
            <FaUserInjured className={styles.icon} />
          </div>
          <div className={styles.text}>
            <Link className={styles.link} href="/admin/teachers">
              <p>Teachers</p>
              <h4>{count?.totalUsers}</h4>
            </Link>
          </div>
        </div>
        <div className={styles.box}>
          <div className={styles.iconContainer}>
            <RiDashboard2Line className={styles.icon} />
          </div>
          <div className={styles.text}>
            <Link className={styles.link} href="/admin/users">
              <p>Admin</p>
              <h4>{count?.totalAdmins}</h4>
            </Link>
          </div>
        </div>
      </div>
      {count.totalMaleStudents && (
        <div className={styles.chart}>
          <div>
            <h2>Student</h2>
            <GenderPieChart
              maleCount={count.totalMaleStudents}
              femaleCount={count.totalFemaleStudents}
            />
          </div>
          <div>
            <h2>Staff</h2>
            <GenderPieChart
              maleCount={count.totalMaleUsers}
              femaleCount={count.totalFemaleUsers}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;

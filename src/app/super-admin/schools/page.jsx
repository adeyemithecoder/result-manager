"use client";
import React, { useEffect, useState } from "react";
import styles from "./AllUser.module.css";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import axios from "axios";
import { BsPencil } from "react-icons/bs";
import { FaTrashCan } from "react-icons/fa6";
import Spinner from "@/components/Spinner/Spinner";

const AllSchools = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const { data: session, status: sessionStatus } = useSession();

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const { data } = await axios.get("/api/school");
        setSchools(data);
      } catch (error) {
        console.error("Error fetching schools:", error);
      }
    };
    fetchSchools();
  }, []);

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      if (session.role !== "SUPER_ADMIN") {
        signOut();
        redirect("/");
      }
    }
  }, [sessionStatus, session]);

  if (sessionStatus === "loading")
    return (
      <h1 className="waitH1">
        <Spinner /> Please wait...
      </h1>
    );
  if (sessionStatus !== "authenticated") redirect("/");

  const handleDeleteSchool = async (schoolId) => {
    if (!window.confirm("Are you sure you want to delete this school?")) return;
    try {
      const { data } = await axios.delete(`/api/school/${schoolId}`);
      alert(data.message);
      setSchools(schools.filter((school) => school.id !== schoolId));
    } catch (error) {
      console.error("There was an error deleting the school!", error);
    }
  };

  schools?.sort((a, b) => {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  });

  const truncateStringSimple = (str, num) => {
    return str.length > num ? str.slice(0, num) + "..." : str;
  };

  return (
    <div className={styles.allSchool}>
      <h1>All Schools</h1>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Logo</th>
              <th>School Name</th>
              <th>Address</th>
              <th>Contact Email</th>
              <th>Phone Number</th>
              <th className={styles.createdDate}>Added on</th>
              <th>Action</th>
            </tr>
          </thead>
          {loading ? (
            <h3>Loading...</h3>
          ) : (
            <tbody>
              {schools.map((school) => (
                <tr key={school.id}>
                  <td>{school.id}</td>
                  <td className={styles.user}>
                    <Image
                      src={school.logo || "/img/noAvatar.png"}
                      alt="img"
                      width={50}
                      height={50}
                      className={styles.userImg}
                    />
                  </td>
                  <td>{truncateStringSimple(school.name, 20)}</td>
                  <td>{truncateStringSimple(school.address, 30)}</td>
                  <td>
                    {truncateStringSimple(
                      school.contactEmail.split("@")[0],
                      10
                    ) +
                      "@" +
                      school.contactEmail.split("@")[1]}
                  </td>
                  <td>{school.phoneNumber}</td>
                  <td className={styles.createdDate}>
                    {new Date(school.createdAt).toLocaleString()}
                  </td>
                  <td>
                    <button>
                      <Link
                        className={styles.link}
                        href={`/super-admin/schools/${school.id}`}
                      >
                        Edit
                      </Link>
                    </button>
                    <button
                      className={styles.delete}
                      onClick={() => handleDeleteSchool(school.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
};

export default AllSchools;

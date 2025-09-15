"use client";
import React, { useEffect, useState } from "react";
import styles from "./AdminList.module.css";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import axios from "axios";
import Spinner from "@/components/Spinner/Spinner";

const AdminList = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const { data: session, status: sessionStatus } = useSession();

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const { data } = await axios.get("/api/school/admin");
        console.log(data);
        setAdmins(data);
      } catch (error) {
        console.error("Error fetching admins:", error);
      }
    };
    fetchAdmins();
  }, [sessionStatus, session]);

  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;
    try {
      const { data } = await axios.delete(`/api/users/${adminId}`);
      alert(data.message);
      setAdmins(admins.filter((admin) => admin.id !== adminId));
    } catch (error) {
      console.error("There was an error deleting the admin!", error);
    }
  };

  const truncateStringSimple = (str, num) => {
    return str.length > num ? str.slice(0, num) + "..." : str;
  };

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      if (session.role !== "SUPER_ADMIN") {
        signOut();
        redirect("/");
      }
    }
  }, [sessionStatus, session]);
  if (sessionStatus == "loading")
    return (
      <h1 className="waitH1">
        <Spinner /> Please wait...
      </h1>
    );
  if (sessionStatus !== "authenticated") redirect("/");
  admins?.sort((a, b) => {
    if (a.username < b.username) {
      return -1;
    }
    if (a.username > b.username) {
      return 1;
    }
    return 0;
  });

  return (
    <div className={styles.adminList}>
      <h1>Admin List</h1>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Id</th>
              <th>Username</th>
              <th>School Name</th>
              <th>Address</th>
              <th>Contact Email</th>
              <th>Phone Number</th>
              <th>Role</th>
              <th>Added on</th>
              <th>Action</th>
            </tr>
          </thead>
          {loading ? (
            <h3>Loading...</h3>
          ) : (
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id}>
                  <td>{admin.schoolId}</td>
                  <td>{admin.username}</td>
                  <td>{admin.school.name}</td>
                  <td>{truncateStringSimple(admin.school.address, 10)}</td>
                  <td>
                    {truncateStringSimple(
                      admin.school.contactEmail.split("@")[0],
                      8
                    ) +
                      "@" +
                      admin.school.contactEmail.split("@")[1]}
                  </td>
                  <td>{admin.school.phoneNumber}</td>
                  <td>{admin.role}</td>
                  <td>{new Date(admin.createdAt).toLocaleString()}</td>
                  <td>
                    <button>
                      <Link
                        className={styles.link}
                        href={`/super-admin/all-admin/${admin.id}`}
                      >
                        Edit
                      </Link>
                    </button>
                    <button
                      className={styles.delete}
                      onClick={() => handleDeleteAdmin(admin.id)}
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

export default AdminList;

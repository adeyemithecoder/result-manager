"use client";
import React, { useEffect, useState } from "react";
import styles from "./AllUser.module.css";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import axios from "axios";
import Spinner from "@/components/Spinner/Spinner";

const AllUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const { data: session, status: sessionStatus } = useSession();
  useEffect(() => {
    setLoading(true);
    const fetchUsers = async () => {
      const { data } = await axios.get(`/api/users/get/${session.schoolId}`);
      setUsers(data);
    };
    fetchUsers();
    setLoading(false);
  }, [session]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const { data } = await axios.delete(`/api/users/${userId}`);
      alert(data.message);
      setUsers(users.filter((user) => user.id !== userId));
    } catch (error) {
      console.error("There was an error deleting the user!", error);
    }
  };
  useEffect(() => {
    if (sessionStatus === "authenticated") {
      if (session.role !== "ADMIN") {
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

  users?.sort((a, b) => {
    if (a.username < b.username) {
      return -1;
    }
    if (a.username > b.username) {
      return 1;
    }
    return 0;
  });
  return (
    <div className={styles.allUser}>
      <h1>School Admin.</h1>
      <div className={styles.tableContainer}>
        {" "}
        <table className={styles.table} border={3}>
          <thead>
            <tr>
              <th>No</th>
              <th>Image</th>
              <th>Name</th>
              <th>Role</th>
              <th>Gender</th>
              <th className={styles.createdDate}>Added on</th>
              <th>Action</th>
            </tr>
          </thead>
          {loading ? (
            <h3>Loading...</h3>
          ) : (
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id}>
                  <td>{index + 1}</td>
                  <td className={styles.user}>
                    <Image
                      src={user.imageUrl || "/img/noAvatar.png"}
                      alt="img"
                      width={45}
                      height={45}
                      className={styles.userImg}
                    />
                  </td>
                  <td>{user.name}</td>
                  <td>{user.role}</td>
                  <td>{user.gender?.toUpperCase()}</td>
                  <td className={styles.createdDate}>
                    {new Date(user.createdAt).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: true,
                    })}
                  </td>
                  <td>
                    <button>
                      {" "}
                      <Link
                        className={styles.link}
                        href={`/admin/users/${user.id}`}
                      >
                        Edit
                      </Link>
                    </button>
                    <button
                      className={styles.delete}
                      onClick={() => handleDeleteUser(user.id)}
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

export default AllUser;

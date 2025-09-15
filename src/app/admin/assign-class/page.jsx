"use client";
import React, { useEffect, useState } from "react";
import styles from "./assignClass.module.css";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import axios from "axios";
import Image from "next/image";

const AllUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { data: session, status: sessionStatus } = useSession();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`/api/teacher/${session.schoolId}`);
        setUsers(data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [session?.schoolId]);

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      if (session.role !== "ADMIN") {
        signOut();
        redirect("/");
      }
    }
  }, [sessionStatus, session]);
  if (sessionStatus == "loading") return <h1>Please wait...</h1>;
  if (loading == "true") return <h1>Please wait...</h1>;
  if (sessionStatus !== "authenticated") redirect("/");

  users?.sort((a, b) => {
    const nameA = a.name.toLowerCase().trim(); // Remove extra spaces
    const nameB = b.name.toLowerCase().trim(); // Remove extra spaces

    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  });

  return (
    <div className={styles.allUser}>
      <h1>Assign class and subject to a teacher</h1>
      <div className={styles.tableContainer}>
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Image</th>
              <th>Name</th>
              <th>Role</th>
              <th>Gender</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id}>
                <td>{index + 1}</td>
                <td className={styles.user}>
                  <Image
                    src={user.imageUrl || "/img/noAvatar.png"}
                    alt="img"
                    width={40}
                    height={40}
                    className={styles.userImg}
                  />
                </td>
                <td>{user.name}</td>
                <td>{user.role}</td>
                <td>{user.gender}</td>
                <td>
                  <button>
                    {" "}
                    <Link
                      className={styles.assyClassLink}
                      href={`/admin/assign-class/${user.id}`}
                    >
                      Assign Class
                    </Link>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllUser;

"use client";
import React, { useEffect, useState } from "react";
import styles from "./task.module.css";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import Spinner from "@/components/Spinner/Spinner";

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
  if (sessionStatus == "loading" || loading == true)
    return (
      <h1 className="waitH1">
        <Spinner /> Please wait...
      </h1>
    );

  if (sessionStatus !== "authenticated") redirect("/");

  return (
    <div className={styles.allUser}>
      <h1>Check Task</h1>
      <div className={styles.tableContainer}>
        {users.length > 0 ? (
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
                    <td>{user.gender}</td>
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
                        <Link
                          className={styles.link}
                          href={`/admin/task/${user.id}`}
                        >
                          Check
                        </Link>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        ) : (
          <h1>No teacher found</h1>
        )}
      </div>
    </div>
  );
};

export default AllUser;

"use client";
import { useEffect, useState } from "react";
import styles from "./dashboard.module.css";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import Spinner from "@/components/Spinner/Spinner";

const Dashboard = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [school, setSchool] = useState({});
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const storedData =
          JSON.parse(localStorage.getItem("studentData")) || [];
        if (!storedData.id) {
          router.push("/");
          return;
        }
        setStudent(storedData);
        const schoolRes = await axios.get(`/api/school/${storedData.schoolId}`);
        setSchool(schoolRes.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  if (loading || !student || !school) {
    return (
      <h1 className="waitH1">
        <Spinner /> Loading...
      </h1>
    );
  }
  console.log(school);
  console.log(student?.level);
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <header className={styles.header}>
          <Image
            src={school.logo}
            alt={school.name}
            width={120}
            height={100}
            className={styles.logo}
          />
          <h1>{school.fullName}</h1>
          <p className={styles.motto}>{school.motto}</p>
        </header>

        {/* Student Info */}
        <section className={styles.studentInfo}>
          <Image
            src={student.image || "/img/noAvatar.png"}
            width={200}
            height={200}
            alt={student.name}
            className={styles.studentImg}
          />
          <div>
            <h2>
              {student.surname} {student.name}
            </h2>
            <p>REGISTRATION NO {student.registrationNo.toUpperCase()}</p>
            <p>LEVEL: {student.level.toUpperCase()}</p>
            <p>GENDER: {student.gender.toUpperCase()}</p>
            <p>AGE: {student.age}</p>
            <p>ACADEMIC YEAR: {student.academicYear.toUpperCase()}</p>
          </div>
        </section>
        <section className={styles.schoolInfo}>
          <h3>Contact Information</h3>
          <p>Address: {school.address}</p>
          <p>Email: {school.contactEmail}</p>
          <p>Phone: {school.phoneNumber}</p>
        </section>
        <footer className={styles.footer}>
          {student.level.toLowerCase().startsWith("j") ||
          student.level.toLowerCase().startsWith("s") ? (
            <p>Principal: {school.principal}</p>
          ) : (
            <p>
              {school.name == "CRYSTAL BRAINS SCHOOL"
                ? "Head mistress:"
                : "Head master:"}{" "}
              {school.headmaster}
            </p>
          )}
        </footer>
      </div>
    </main>
  );
};

export default Dashboard;

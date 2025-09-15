"use client";
import Image from "next/image";
import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import styles from "./printout.module.css";

const JayRose = ({
  student,
  subjects,
  formTeacherName,
  attendanceList,
  psychomotor,
  effectiveTraits,
  headOfSchoolRemark,
  formTeacherRemark,
  school,
  selectedTerm,
}) => {
  const contentToPrint = useRef(null);
  const handlePrint = useReactToPrint({
    documentTitle: "Print This Document",
    content: () => contentToPrint.current,
    onBeforePrint: () => console.log("before printing..."),
    onAfterPrint: () => console.log("after printing..."),
    removeAfterPrint: true,
  });

  const calculateTotal = (subject) => {
    const total =
      (parseFloat(subject.firstCA) || 0) +
      (parseFloat(subject.secondCA) || 0) +
      (parseFloat(subject.project) || 0) +
      (parseFloat(subject.affective) || 0) +
      (parseFloat(subject.exam) || 0);
    return total;
  };

  const calculateTotalScoreObtained = () => {
    return subjects.reduce(
      (total, subject) => total + calculateTotal(subject),
      0
    );
  };

  const calculateAveragePercentage = () => {
    const totalScoreObtained = calculateTotalScoreObtained();
    return (totalScoreObtained / (subjects.length * 100)) * 100;
  };

  return (
    <div className={styles.Container}>
      <div className={styles.printoutContainer}>
        <div className={styles.reportCard} ref={contentToPrint}>
          <div className={styles.watermark}>
            <Image
              className={styles.img}
              src={school.logo}
              alt="logo"
              height={400}
              width={450}
            />
          </div>
          <header className={styles.header}>
            <div className={styles.logo}>
              <div className={styles.imageContainer}>
                <Image src={school.logo} alt="logo" height={100} width={110} />
              </div>
            </div>
            <div className={styles.headerContents}>
              <h4>{school?.fullName && school.fullName.toUpperCase()}</h4>
              <span>MOTTO: {school?.motto && school.motto.toUpperCase()}</span>
              <p>ADDRESS: {school?.address && school?.address.toUpperCase()}</p>
              <h4 className={styles.term}>
                REPORT SHEET FOR {selectedTerm} TERM, {student.academicYear}{" "}
                ACADEMIC SESSION
              </h4>
            </div>
          </header>
          <section className={styles.studentInfo}>
            <div className={styles.Info1}>
              <h4>STUDENT INFORMATION</h4>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Surname</td>
                    <td>{student.surname?.toUpperCase()}</td>
                  </tr>
                  <tr>
                    <td>Name</td>
                    <td>{student.name?.toUpperCase()}</td>
                  </tr>
                  <tr>
                    <td>Class</td>
                    <td>{student.level?.toUpperCase()}</td>
                  </tr>
                  <tr>
                    <td>Gender</td>
                    <td>{student.gender?.toUpperCase()}</td>
                  </tr>
                  <tr>
                    <td>Reg No</td>
                    <td>{student.registrationNo}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className={styles.Info2}>
              <h4>STUDENT SUMMARY</h4>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Number of Subjects</td>
                    <td>{subjects.length}</td>
                  </tr>
                  <tr>
                    <td>Max Score Obtainable</td>
                    <td>{subjects.length * 100}</td>
                  </tr>
                  <tr>
                    <td>Total Score Obtained</td>
                    <td>{calculateTotalScoreObtained()}</td>
                  </tr>
                  <tr>
                    <td>Average Percentage</td>
                    <td>{calculateAveragePercentage().toFixed(2)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className={styles.Info3}>
              <h4>ATTENDANCE</h4>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Days</th>
                    <th>Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>School Opened</td>
                    <td>{attendanceList?.schoolOpenDays}</td>
                  </tr>
                  <tr>
                    <td>Absent</td>
                    <td>{attendanceList?.daysAbsent}</td>
                  </tr>
                  <tr>
                    <td>Present</td>
                    <td>{attendanceList?.daysPresent}</td>
                  </tr>
                </tbody>
              </table>
              <p>
                <h4>TERM BEGINS:</h4>
                <span>
                  On{" "}
                  {
                    school?.termDates?.find(
                      (term) => term?.termType == selectedTerm
                    )?.termBegins
                  }
                </span>
              </p>
              <p>
                <h4>TERM ENDED:</h4>
                <span>
                  On{" "}
                  {
                    school?.termDates?.find(
                      (term) => term?.termType == selectedTerm
                    )?.termEnds
                  }
                </span>
              </p>
              <p>
                <h4>NEXT TERM BEGINS:</h4>
                <span>
                  On{" "}
                  {
                    school?.termDates?.find(
                      (term) => term?.termType === selectedTerm
                    )?.nextTermBegin
                  }
                </span>{" "}
              </p>
            </div>
          </section>
          <h4 className={styles.performanceh4}>
            subject performance (cognitive domain)
          </h4>
          <section className={styles.grades}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Subjects</th>
                  <th>CA 1</th>
                  <th>CA 2</th>
                  <th>Project</th>
                  <th>Affective</th>
                  <th>Exam</th>
                  <th>Total Score</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject, index) => {
                  const total = calculateTotal(subject);

                  return (
                    <tr key={index}>
                      <td>{subject.subjectName}</td>
                      <td>{subject.firstCA}</td>
                      <td>{subject.secondCA}</td>
                      <td>{subject.project}</td>
                      <td>{subject.affective}</td>
                      <td>{subject.exam}</td>
                      <td>{total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          <section className={styles.effectiveTriats}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Psychomotor</th>
                  <th>Ratings</th>
                </tr>
              </thead>
              <tbody>
                {psychomotor.map((row) => (
                  <tr key={row.id}>
                    <td>{row.trait}</td>
                    <td>{row.rating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Effective Traits</th>
                  <th>Ratings</th>
                </tr>
              </thead>
              <tbody>
                {effectiveTraits.map((row) => (
                  <tr key={row.id}>
                    <td>{row.trait}</td>
                    <td>{row.rating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <footer className={styles.footer}>
            <div>
              <p>
                <h4>FORM TEACHER:</h4>
                <span>{formTeacherName}</span>{" "}
              </p>
              <p>
                <h4>{"FORM TEACHER'S COMMENTS:"}</h4>
                <span> {formTeacherRemark && formTeacherRemark}</span>
              </p>
              <p>
                <h4>
                  {" "}
                  {student?.level?.startsWith("j") ||
                  student?.level?.startsWith("s")
                    ? "PRINCIPAL:"
                    : "HEAD MASTER:"}{" "}
                </h4>
                <span>{school?.principal && school.principal}</span>
              </p>
              <p>
                <h4>
                  {" "}
                  {student?.level?.startsWith("j") ||
                  student?.level?.startsWith("s")
                    ? "PRINCIPAL'S COMMENTS:"
                    : "HEAD MASTER'S COMMENTS:"}
                </h4>
                <span>{headOfSchoolRemark} </span>
              </p>
            </div>
          </footer>
        </div>
      </div>
      <div className={styles.printButton}>
        <button onClick={handlePrint}>Print</button>
      </div>
    </div>
  );
};

export default JayRose;

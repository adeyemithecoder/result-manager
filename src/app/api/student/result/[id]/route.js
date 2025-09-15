import { NextResponse } from "next/server";
import prisma from "../../../../../../prisma/prisma";

export async function GET(request, { params }) {
  const { id } = params;
  const [encodedAcademicYear, studentId, selectedTerm] = id.split("-");
  const academicYear = decodeURIComponent(encodedAcademicYear);

  if (!selectedTerm || !academicYear) {
    return new NextResponse(
      JSON.stringify({
        message: "Term and academic year must be provided",
        status: 400,
      }),
      { status: 400 }
    );
  }

  try {
    // Fetch the specific student details
    const student = await prisma.student.findUnique({
      where: {
        id: Number(studentId),
        academicYear,
      },
      include: {
        traitRatings: true,
        attendanceList: true,
        school: {
          include: {
            termDates: true,
          },
        },
        attendance: {
          where: {
            termType: selectedTerm.toUpperCase(),
          },
        },
        terms: {
          where: {
            termType: selectedTerm.toUpperCase(),
          },
          include: {
            subjects: true,
          },
        },
      },
    });

    if (!student) {
      throw new Error("Student not found");
    }

    const { schoolId, level, variant } = student;

    // Construct the where clause to fetch students in the same class and academic year
    let whereClause = { level, schoolId, academicYear };
    if (variant) {
      whereClause.variant = variant;
    }

    // Fetch all students for the same class (level, schoolId, variant, academicYear)
    const studentsInClass = await prisma.student.findMany({
      where: whereClause,
      include: {
        terms: {
          where: {
            termType: selectedTerm.toUpperCase(),
          },
          include: {
            subjects: true,
          },
        },
      },
    });

    // Get the total number of students in the class
    const totalStudents = await prisma.student.count({
      where: whereClause,
    });

    // Calculate individual student total score and average
    const studentSubjects = student.terms.flatMap((term) => term.subjects);
    const studentTotalScore = studentSubjects.reduce((acc, subject) => {
      return (
        acc +
        (subject.firstCA || 0) +
        (subject.secondCA || 0) +
        (subject.thirdCA || 0) +
        (subject.fourthCA || 0) +
        (subject.fifthCA || 0) +
        (subject.sixthCA || 0) +
        (subject.project || 0) +
        (subject.note || 0) +
        (subject.assignment || 0) +
        (subject.exam || 0)
      );
    }, 0);
    const studentFinalAverage = studentSubjects.length
      ? studentTotalScore / studentSubjects.length
      : 0;

    // Calculate class subject scores
    const subjectScores = {};

    studentsInClass.forEach((student) => {
      student.terms.forEach((term) => {
        term.subjects.forEach((subject) => {
          const totalScore =
            (subject.firstCA || 0) +
            (subject.secondCA || 0) +
            (subject.thirdCA || 0) +
            (subject.fourthCA || 0) +
            (subject.fifthCA || 0) +
            (subject.sixthCA || 0) +
            (subject.project || 0) +
            (subject.note || 0) +
            (subject.assignment || 0) +
            (subject.exam || 0);

          // Include only if the total score is greater than zero
          if (totalScore > 0) {
            if (!subjectScores[subject.subjectName]) {
              subjectScores[subject.subjectName] = {
                totalScores: [],
              };
            }
            subjectScores[subject.subjectName].totalScores.push(totalScore);
          }
        });
      });
    });

    // Calculate highest, lowest, and average for each subject
    const subjectAverages = {};
    for (const subjectName in subjectScores) {
      const scores = subjectScores[subjectName].totalScores;
      const totalScoreSum = scores.reduce((sum, score) => sum + score, 0);
      const average = totalScoreSum / scores.length;

      subjectScores[subjectName].highest = Math.max(...scores);
      subjectScores[subjectName].lowest = Math.min(...scores);
      subjectScores[subjectName].average = average;
      subjectAverages[subjectName] = average;
    }

    // Calculate overall class average
    const classAverages = Object.values(subjectAverages);
    const classAverage =
      classAverages.reduce((sum, avg) => sum + avg, 0) / classAverages.length;

    // Calculate highest and lowest class averages
    const highestClassAverage =
      classAverages.length > 0 ? Math.max(...classAverages) : 0;
    const lowestClassAverage =
      classAverages.length > 0 ? Math.min(...classAverages) : 0;

    const subjects = studentSubjects
      .map((subject) => ({
        subjectName: subject.subjectName,
        firstCA: subject.firstCA,
        secondCA: subject.secondCA,
        thirdCA: subject.thirdCA,
        fourthCA: subject.fourthCA,
        fifthCA: subject.fifthCA,
        sixthCA: subject.sixthCA,
        project: subject.project,
        note: subject.note,
        assignment: subject.assignment,
        exam: subject.exam,
        totalScore:
          (subject.firstCA || 0) +
          (subject.secondCA || 0) +
          (subject.thirdCA || 0) +
          (subject.fourthCA || 0) +
          (subject.fifthCA || 0) +
          (subject.sixthCA || 0) +
          (subject.project || 0) +
          (subject.note || 0) +
          (subject.assignment || 0) +
          (subject.exam || 0),
      }))
      .filter((subject) => subject.totalScore > 0);
    console.log(totalStudents);
    console.log(classAverage, highestClassAverage, lowestClassAverage);
    return NextResponse.json({
      student,
      subjects,
      attendance: student.attendance,
      subjectScores,
      studentFinalAverage,
      classAverage,
      highestClassAverage,
      lowestClassAverage,
      totalStudents,
    });
  } catch (error) {
    console.error("Error fetching student and subject results:", error);
    return new NextResponse(
      JSON.stringify({
        message: "Failed to fetch student and subject results",
        status: 404,
      }),
      { status: 404 }
    );
  }
}

export async function PATCH(request, { params }) {
  const { id } = params;
  const {
    formTeacherRemark,
    headOfSchoolRemark,
    traitRatings,
    formTeacherName,
  } = await request.json();

  try {
    // Ensure each trait rating has the type field
    traitRatings.forEach((rating) => {
      if (!rating.type) {
        throw new Error(`Trait rating missing type: ${JSON.stringify(rating)}`);
      }
    });
    const updatedTraitRatings = traitRatings.map(
      ({ id, studentId, ...rest }) => rest
    );
    console.log(formTeacherName);
    const studentUpdated = await prisma.student.update({
      where: { id: Number(id) },
      data: {
        formTeacherRemark,
        formTeacherName,
        headOfSchoolRemark,
        traitRatings: {
          deleteMany: {},
          create: updatedTraitRatings,
        },
      },
    });

    return new Response(
      JSON.stringify({ message: "Student data updated successfully" }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error updating student data:", error);
    return new Response(
      JSON.stringify({ error: "Unable to update student data" }),
      {
        status: 500,
      }
    );
  }
}

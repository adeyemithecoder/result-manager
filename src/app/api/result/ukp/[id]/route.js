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
        resultAvailability: true,
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

    // Initialize variables for calculating subject scores
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
            (subject.note || 0) +
            (subject.rt || 0) +
            (subject.project || 0) +
            (subject.affective || 0) +
            (subject.assignment || 0) +
            (subject.exam || 0);

          if (totalScore > 0) {
            if (!subjectScores[subject.subjectName]) {
              subjectScores[subject.subjectName] = [];
            }
            subjectScores[subject.subjectName].push(totalScore);
          }
        });
      });
    });

    const subjectPosition = {};
    const totalStudents = studentsInClass.length; // Total students in the class

    // Moved this block before calculating subjectPosition
    const subjects = student.terms
      .flatMap((term) => term.subjects)
      .map((subject) => ({
        subjectName: subject.subjectName,
        firstCA: subject.firstCA,
        secondCA: subject.secondCA,
        thirdCA: subject.thirdCA,
        fourthCA: subject.fourthCA,
        fifthCA: subject.fifthCA,
        sixthCA: subject.sixthCA,
        note: subject.note,
        rt: subject.rt,
        project: subject.project,
        affective: subject.affective,
        assignment: subject.assignment,
        exam: subject.exam,
        totalScore:
          (subject.firstCA || 0) +
          (subject.secondCA || 0) +
          (subject.thirdCA || 0) +
          (subject.fourthCA || 0) +
          (subject.fifthCA || 0) +
          (subject.sixthCA || 0) +
          (subject.note || 0) +
          (subject.rt || 0) +
          (subject.project || 0) +
          (subject.affective || 0) +
          (subject.assignment || 0) +
          (subject.exam || 0),
      }))
      .filter((subject) => subject.totalScore > 0);
    for (const subjectName in subjectScores) {
      const scores = subjectScores[subjectName];
      scores.sort((a, b) => b - a); // Sort scores in descending order

      // Create a rank map to handle tied scores
      const rankMap = {};
      let rank = 1;

      scores.forEach((score, index) => {
        if (index === 0 || score !== scores[index - 1]) {
          rankMap[score] = rank;
        }
        rank += 1;
      });

      // Find the student's position using the rank map
      const studentTotalScore = subjects.find(
        (subject) => subject.subjectName === subjectName
      )?.totalScore;

      subjectPosition[subjectName] = {
        position: studentTotalScore ? rankMap[studentTotalScore] : null,
        highestScore: Math.max(...scores),
        lowestScore: Math.min(...scores),
      };
    }

    console.log(subjects);
    return NextResponse.json({
      student,
      subjects,
      attendance: student.attendance,
      subjectPosition,
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

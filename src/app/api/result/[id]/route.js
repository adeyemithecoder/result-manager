import { NextResponse } from "next/server";
import prisma from "../../../../../prisma/prisma";

export async function GET(request, { params }) {
  const { id } = params;
  const [encodedAcademicYear, schoolId, selectedTerm, level, variant] =
    id.split("-");
  const academicYear = decodeURIComponent(encodedAcademicYear);

  if (!selectedTerm || !academicYear || !level) {
    return new NextResponse(
      JSON.stringify({
        message: "Term, academic year, and class must be provided",
        status: 400,
      }),
      { status: 400 }
    );
  }

  try {
    // Build where clause
    let whereClause = { level, schoolId: Number(schoolId), academicYear };
    if (variant) whereClause.variant = variant;
    const studentsInClass = await prisma.student.findMany({
      where: whereClause,
      include: {
        traitRatings: true,
        attendanceList: true,
        resultAvailability: true,
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

    const totalStudents = studentsInClass.length;
    const subjectScores = {};

    // Aggregate all scores for subject-wide rankings
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

    // Preprocess ranking maps
    const subjectRankMap = {};
    for (const subjectName in subjectScores) {
      const scores = subjectScores[subjectName];
      scores.sort((a, b) => b - a);

      const rankMap = {};
      let rank = 1;
      scores.forEach((score, index) => {
        if (index === 0 || score !== scores[index - 1]) {
          rankMap[score] = rank;
        }
        rank += 1;
      });

      subjectRankMap[subjectName] = {
        rankMap,
        highestScore: Math.max(...scores),
        lowestScore: Math.min(...scores),
      };
    }

    // Prepare results for each student
    const resultArray = studentsInClass.map((student) => {
      const subjects = student.terms
        .flatMap((term) => term.subjects)
        .map((subject) => {
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

          return {
            ...subject,
            totalScore,
          };
        })
        .filter((subject) => subject.totalScore > 0);

      const subjectPosition = {};
      subjects.forEach(({ subjectName, totalScore }) => {
        const rankData = subjectRankMap[subjectName];
        subjectPosition[subjectName] = {
          position: rankData?.rankMap[totalScore] ?? null,
          highestScore: rankData?.highestScore ?? null,
          lowestScore: rankData?.lowestScore ?? null,
        };
      });

      return {
        student,
        subjects,
        attendance: student.attendance,
        subjectPosition,
        totalStudents,
      };
    });

    return NextResponse.json(resultArray);
  } catch (error) {
    console.error("Error fetching class results:", error);
    return new NextResponse(
      JSON.stringify({
        message: "Failed to fetch class results",
        status: 500,
      }),
      { status: 500 }
    );
  }
}

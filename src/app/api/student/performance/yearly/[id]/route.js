import { NextResponse } from "next/server";
import prisma from "../../../../../../../prisma/prisma";

export async function GET(request, { params }) {
  const { id } = params;
  const [encodedAcademicYear, schoolId, level, variant] = id.split("-");
  const academicYear = decodeURIComponent(encodedAcademicYear);

  if (!academicYear || !level) {
    return new NextResponse(
      JSON.stringify({
        message: "Academic year and class must be provided",
        status: 400,
      }),
      { status: 400 }
    );
  }

  try {
    const whereClause = {
      academicYear,
      schoolId: Number(schoolId),
      level,
      ...(variant && variant !== "undefined" && { variant }),
    };

    const students = await prisma.student.findMany({
      where: whereClause,
      include: {
        terms: {
          include: {
            subjects: true,
          },
        },
      },
    });

    if (students.length === 0) {
      return new NextResponse(
        JSON.stringify({ message: "No students found", status: 404 }),
        { status: 404 }
      );
    }

    // Helper: Calculate scores
    function calculateTermlyAndTotalScores(student) {
      const termlyScores = { FIRST: 0, SECOND: 0, THIRD: 0, TOTAL: 0 };

      student.terms.forEach((term) => {
        const termScore = term.subjects.reduce((sum, subject) => {
          return (
            sum +
            (subject.firstCA || 0) +
            (subject.secondCA || 0) +
            (subject.thirdCA || 0) +
            (subject.fourthCA || 0) +
            (subject.fifthCA || 0) +
            (subject.sixthCA || 0) +
            (subject.project || 0) +
            (subject.note || 0) +
            (subject.rt || 0) +
            (subject.affective || 0) +
            (subject.assignment || 0) +
            (subject.exam || 0)
          );
        }, 0);

        termlyScores[term.termType] = termScore;
        termlyScores.TOTAL += termScore;
      });

      return termlyScores;
    }

    // Build output data
    const simplifiedData = students.map((student) => {
      const termlyScores = calculateTermlyAndTotalScores(student);
      const termCount = student.terms.length || 1;
      const average = Number((termlyScores.TOTAL / termCount).toFixed(2));

      return {
        surname: student.surname,
        name: student.name,
        level: student.level,
        termlyScores,
        average,
      };
    });

    // Sort by total score
    simplifiedData.sort((a, b) => b.termlyScores.TOTAL - a.termlyScores.TOTAL);

    // Assign ranks
    let currentRank = 1;
    simplifiedData.forEach((student, index) => {
      if (
        index > 0 &&
        student.termlyScores.TOTAL ===
          simplifiedData[index - 1].termlyScores.TOTAL
      ) {
        student.position = simplifiedData[index - 1].position;
      } else {
        student.position = currentRank;
      }
      currentRank++;
    });

    return NextResponse.json(simplifiedData);
  } catch (error) {
    console.error("Error fetching data:", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal Server Error", status: 500 }),
      { status: 500 }
    );
  }
}

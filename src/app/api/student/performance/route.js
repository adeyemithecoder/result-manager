import { NextResponse } from "next/server";
import prisma from "../../../../../prisma/prisma";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const selectedClass = searchParams.get("selectedClass");
  const schoolId = searchParams.get("schoolId");
  const termType = searchParams.get("termType");
  const academicYear = searchParams.get("academicYear");

  const [level, variant] = selectedClass?.split("-") || [];

  if (!level || !schoolId || !termType) {
    return NextResponse.json(
      { message: "Missing required query parameters" },
      { status: 400 }
    );
  }

  try {
    const whereClause = {
      academicYear,
      schoolId: Number(schoolId),
      level,
      terms: { some: { termType } },
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

    // STEP 1: Prepare raw student data with subject scores
    const rawData = students.map((student) => {
      const term = student.terms.find(
        (t) => t.termType === termType.toUpperCase()
      );

      const subjectScores = {};
      let totalScore = 0;
      let subjectCount = 0;

      term?.subjects?.forEach((subject) => {
        const score =
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
          (subject.exam || 0);

        if (score > 0) {
          subjectScores[subject.subjectName] = score;
          totalScore += score;
          subjectCount++;
        }
      });

      const average =
        subjectCount > 0
          ? parseFloat((totalScore / subjectCount).toFixed(2))
          : 0;

      return {
        surname: student.surname,
        name: student.name,
        level: student.level,
        variant: student.variant,
        subjects: subjectScores,
        totalScore,
        average,
      };
    });

    const filtered = rawData.filter((student) => student.totalScore > 0);

    const sorted = [...filtered].sort((a, b) => b.totalScore - a.totalScore);
    let currentRank = 1;
    sorted.forEach((student, index) => {
      if (index > 0 && student.totalScore === sorted[index - 1].totalScore) {
        student.position = sorted[index - 1].position;
      } else {
        student.position = currentRank;
      }
      currentRank++;
    });
    const finalResult = filtered.map((student) => {
      const found = sorted.find(
        (s) => s.name === student.name && s.surname === student.surname
      );
      return {
        surname: student.surname,
        level: student.level,
        variant: student.variant,
        name: student.name,
        ...student.subjects,
        totalScore: student.totalScore,
        average: student.average,
        position: found?.position || null,
      };
    });

    return NextResponse.json(finalResult);
  } catch (error) {
    console.error("Error fetching data:", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal Server Error", status: 500 }),
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import prisma from "../../../../../../prisma/prisma";

export async function GET(request, { params }) {
  const { id } = params;
  const [termType, schoolId, encodedAcademicYear, level, variant] =
    id.split("-");
  const academicYear = decodeURIComponent(encodedAcademicYear);

  if (!level || !schoolId || !termType || !academicYear) {
    return NextResponse.json(
      { error: "Level, School ID, and termType are required" },
      { status: 400 }
    );
  }

  try {
    let whereClause = {
      level: level,
      schoolId: Number(schoolId),
      academicYear,
    };
    if (variant) {
      whereClause.variant = variant;
    }

    const studentsWithResults = await prisma.student.findMany({
      where: whereClause,
      select: {
        id: true,
        level: true,
        username: true,
        password: true,
        name: true,
        surname: true,
      },
    });

    return NextResponse.json(studentsWithResults);
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students by class" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import prisma from "../../../../../prisma/prisma";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const [schoolId, level, variant, encodedAcademicYear] = id.split("-");
    const academicYear = decodeURIComponent(encodedAcademicYear);

    if (!schoolId || !level || !academicYear) {
      return NextResponse.json(
        { error: "schoolId, level and academicYear are required" },
        { status: 400 }
      );
    }

    const whereClause = {
      schoolId: Number(schoolId),
      level,
      academicYear,
    };

    if (variant) whereClause.variant = variant;

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

    return NextResponse.json(students, { status: 200 });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import prisma from "../../../../prisma/prisma";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const schoolId = searchParams.get("schoolId");
  const academicYear = searchParams.get("academicYear");

  const schoolIdNum = parseInt(schoolId, 10);
  if (isNaN(schoolIdNum) || !academicYear) {
    return NextResponse.json(
      { error: "Valid School ID and academic year are required" },
      { status: 400 }
    );
  }

  try {
    const students = await prisma.student.findMany({
      where: { schoolId: schoolIdNum, academicYear },
      select: {
        name: true,
        surname: true,
        level: true,
        variant: true,
        password: true,
        username: true,
      },
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students by class" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import prisma from "../../../../prisma/prisma";

export async function PUT(req) {
  try {
    const {
      schoolId,
      level,
      variant,
      academicYear,
      nextLevel,
      nextAcademicYear,
    } = await req.json();

    // ✅ Validate required fields
    if (
      !schoolId ||
      !level ||
      !academicYear ||
      !nextLevel ||
      !nextAcademicYear
    ) {
      return NextResponse.json(
        {
          error:
            "schoolId, level, academicYear, nextLevel, and nextAcademicYear are required",
        },
        { status: 400 }
      );
    }

    const whereClause = {
      schoolId: Number(schoolId),
      level,
      academicYear,
    };
    if (variant) whereClause.variant = variant;

    // === Find all students ===
    const students = await prisma.student.findMany({
      where: whereClause,
      select: { id: true },
    });

    const studentIds = students.map((s) => s.id);
    if (studentIds.length === 0) {
      return NextResponse.json(
        { message: "No students found for the selected criteria" },
        { status: 404 }
      );
    }

    // === Delete related records ===
    await prisma.attendance.deleteMany({
      where: { studentId: { in: studentIds } },
    });
    await prisma.attendanceList.deleteMany({
      where: { studentId: { in: studentIds } },
    });
    await prisma.payment.deleteMany({
      where: { studentId: { in: studentIds } },
    });
    await prisma.resultAvailability.deleteMany({
      where: { studentId: { in: studentIds } },
    });
    await prisma.traitRating.deleteMany({
      where: { studentId: { in: studentIds } },
    });
    await prisma.studentTask.deleteMany({
      where: { studentId: { in: studentIds } },
    });

    // === Reset subjects ===
    const terms = await prisma.term.findMany({
      where: { studentId: { in: studentIds } },
      include: { subjects: true },
    });

    for (const term of terms) {
      await prisma.subject.updateMany({
        where: { termId: term.id },
        data: {
          firstCA: null,
          secondCA: null,
          thirdCA: null,
          fourthCA: null,
          fifthCA: null,
          sixthCA: null,
          project: null,
          note: null,
          rt: null,
          affective: null,
          assignment: null,
          exam: null,
        },
      });
    }

    // === Update students' level and academic year ===
    await prisma.student.updateMany({
      where: whereClause,
      data: {
        level: nextLevel,
        academicYear: nextAcademicYear,
      },
    });

    return NextResponse.json(
      {
        message: `✅ ${studentIds.length} students successfully moved to ${nextLevel} for ${nextAcademicYear}. All previous records cleared, subjects preserved.`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error promoting students:", error);
    return NextResponse.json(
      { error: "Failed to promote students", details: error.message },
      { status: 500 }
    );
  }
}

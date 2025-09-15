import { NextResponse } from "next/server";
import prisma from "../../../../../prisma/prisma";

export async function PATCH(request) {
  const {
    username,
    termType,
    totalPresent,
    totalAbsent,
    presentDates,
    academicYear,
    absentDates,
  } = await request.json();

  try {
    // Fetch the student by username and academic year
    const student = await prisma.student.findFirst({
      where: { username, academicYear },
      include: { attendance: true },
    });
    if (!student) {
      console.log("Student not found");
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
    }

    // Check if attendance exists for the termType
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        studentId: student.id,
        termType,
      },
    });
    console.log(existingAttendance);
    if (!existingAttendance) {
      console.log("Attendance not found for the termType");
      return NextResponse.json(
        { message: "Attendance not found for the termType" },
        { status: 404 }
      );
    }

    // Update existing attendance
    const updatedAttendance = await prisma.attendance.update({
      where: {
        id: existingAttendance.id,
      },
      data: {
        totalPresent,
        totalAbsent,
        presentDates,
        absentDates,
      },
    });

    return NextResponse.json(
      { message: "Attendance updated successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { error: "Failed to update attendance" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const {
    studentId,
    termType,
    session,
    schoolOpenDays,
    daysAbsent,
    daysPresent,
  } = await request.json();

  try {
    // Check if attendance already exists for the student, termType, and session
    const existingAttendance = await prisma.attendanceList.findFirst({
      where: {
        studentId,
        termType,
        session,
      },
    });

    if (existingAttendance) {
      // Update the existing attendance record
      const updatedAttendance = await prisma.attendanceList.update({
        where: {
          id: existingAttendance.id,
        },
        data: {
          schoolOpenDays: Number(schoolOpenDays),
          daysAbsent: Number(daysAbsent),
          daysPresent: Number(daysPresent),
        },
      });

      return NextResponse.json(
        {
          message: "Attendance updated successfully.",
          updatedAttendance,
        },
        { status: 200 }
      );
    } else {
      // Create a new attendance record if it doesn't exist
      const newAttendance = await prisma.attendanceList.create({
        data: {
          studentId: Number(studentId),
          termType,
          session,
          schoolOpenDays: Number(schoolOpenDays),
          daysAbsent: Number(daysAbsent),
          daysPresent: Number(daysPresent),
        },
      });

      return NextResponse.json(
        { message: "Attendance marked successfully.", newAttendance },
        { status: 201 }
      );
    }
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { error: "Failed to mark or update attendance" },
      { status: 500 }
    );
  }
}

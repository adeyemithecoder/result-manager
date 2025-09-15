import { NextResponse } from "next/server";
import prisma from "../../../../../prisma/prisma";

export async function POST(req) {
  const body = await req.json();
  let {
    level,
    password,
    name,
    surname,
    username,
    gender,
    schoolId,
    academicYear,
    age,
    registrationNo,
  } = body;

  const variant = level.split("-")[1];
  level = level.split("-")[0];

  try {
    if (
      !level ||
      !password ||
      !name ||
      !surname ||
      !schoolId ||
      !academicYear
    ) {
      return new NextResponse(
        JSON.stringify({
          message: `Some required field are missing.`,
          status: 409,
        })
      );
    } else {
      const existingStudent = await prisma.student.findUnique({
        where: {
          username: username,
        },
      });

      if (existingStudent) {
        return new NextResponse(
          JSON.stringify({
            message: `Student with username ${existingStudent.username} already exists.`,
            status: 409,
          })
        );
      } else {
        const newStudent = await prisma.student.create({
          data: {
            level,
            password,
            variant,
            name,
            surname,
            username,
            gender,
            schoolId: Number(schoolId),
            academicYear,
            age,
            registrationNo,
          },
        });
      }

      // Create attendance records for all three terms
      // const termTypes = ["FIRST", "SECOND", "THIRD"];
      // const attendancePromises = termTypes.map((termType) =>
      //   prisma.attendance.create({
      //     data: {
      //       studentId: newStudent.id,
      //       totalPresent: 0,
      //       totalAbsent: 0,
      //       absentDates: [],
      //       presentDates: [],
      //       termType: termType,
      //     },
      //   })
      // );

      // await Promise.all(attendancePromises);

      return new NextResponse(
        JSON.stringify({
          message: "Student registered successfully!",
          status: 201,
        }),
        { status: 201 }
      );
    }
  } catch (err) {
    console.log(err);
    return new NextResponse(
      JSON.stringify({
        error: "Failed to create new student",
        status: 500,
      }),
      { status: 500 }
    );
  }
}

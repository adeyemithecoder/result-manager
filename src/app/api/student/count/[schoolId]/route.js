import { NextResponse } from "next/server";
import prisma from "../../../../../../prisma/prisma";

export async function GET(request, { params }) {
  const { schoolId } = params;
  try {
    const totalStudents = await prisma.student.count({
      where: {
        schoolId: Number(schoolId),
      },
    });

    const secondaryStudents = await prisma.student.count({
      where: {
        schoolId: Number(schoolId),
        OR: [
          {
            level: {
              contains: "js", // For Junior Secondary
              mode: "insensitive",
            },
          },
          {
            level: {
              contains: "ss", // For Senior Secondary
              mode: "insensitive",
            },
          },
        ],
      },
    });

    // Calculate primary students by subtracting secondary students from total students
    const primaryStudents = totalStudents - secondaryStudents;

    const totalMaleStudents = await prisma.student.count({
      where: {
        schoolId: Number(schoolId),
        gender: {
          equals: "male",
          mode: "insensitive",
        },
      },
    });

    const totalFemaleStudents = await prisma.student.count({
      where: {
        schoolId: Number(schoolId),
        gender: {
          equals: "female",
          mode: "insensitive",
        },
      },
    });

    const totalUsers = await prisma.user.count({
      where: {
        schoolId: Number(schoolId),
        role: "USER",
      },
    });

    const totalAdmins = await prisma.user.count({
      where: {
        schoolId: Number(schoolId),
        role: {
          in: ["ADMIN", "ACCOUNTANT"],
        },
      },
    });

    const totalMaleUsers = await prisma.user.count({
      where: {
        schoolId: Number(schoolId),
        role: "USER",
        gender: {
          equals: "male",
          mode: "insensitive",
        },
      },
    });

    const totalFemaleUsers = await prisma.user.count({
      where: {
        schoolId: Number(schoolId),
        role: "USER",
        gender: {
          equals: "female",
          mode: "insensitive",
        },
      },
    });

    return NextResponse.json({
      totalStudents,
      primaryStudents,
      secondaryStudents,
      totalMaleStudents,
      totalFemaleStudents,
      totalUsers,
      totalAdmins,
      totalMaleUsers,
      totalFemaleUsers,
    });
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch students");
  }
}

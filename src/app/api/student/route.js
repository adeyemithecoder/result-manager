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

// export async function GET(req) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const schoolId = searchParams.get("schoolId");
//     if (!schoolId) {
//       return new NextResponse(
//         JSON.stringify({ message: "Missing required fields", status: 400 }),
//         { status: 400 }
//       );
//     }
//     const event = await prisma.event.findMany({
//       where: {
//         schoolId,
//       },
//     });

//     return new NextResponse(JSON.stringify(event), { status: 200 });
//   } catch (err) {
//     console.error("Error retrieving staff members:", err);
//     return new NextResponse(
//       JSON.stringify({
//         message: "Failed to retrieve staff members",
//         error: err.message,
//         status: 500,
//       }),
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import prisma from "../../../../../../prisma/prisma";

export async function GET(request, { params }) {
  const { id } = params;
  const username = id.split("-")[0];
  const password = id.split("-")[1];
  try {
    const studentByUsername = await prisma.student.findUnique({
      where: {
        username: username,
      },
    });

    if (!studentByUsername) {
      return new NextResponse(
        JSON.stringify({
          message: "Username not found",
          status: 404,
        })
      );
    }
    const student = await prisma.student.findFirst({
      where: {
        AND: [{ username: username }, { password: password }],
      },
    });

    if (!student) {
      return new NextResponse(
        JSON.stringify({
          message: "Wrong password",
          status: 404,
        })
      );
    }
    return NextResponse.json(student);
  } catch (err) {
    console.error(err);
    throw new Error("Failed to fetch user");
  }
}

import { NextResponse } from "next/server";
import prisma from "../../../../../prisma/prisma";

export async function GET(request, { params }) {
  const { id } = params;
  try {
    // Fetch users with role USER
    const users = await prisma.user.findMany({
      where: {
        role: "USER",
        schoolId: Number(id),
      },
    });
    return NextResponse.json(users);
  } catch (err) {
    console.error(err);
    throw new Error("Failed to fetch users");
  } finally {
    await prisma.$disconnect();
  }
}

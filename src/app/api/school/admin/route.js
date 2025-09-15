import { NextResponse } from "next/server";
import prisma from "../../../../../prisma/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: "ADMIN",
      },
      include: {
        school: true,
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

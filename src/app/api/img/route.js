import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req) {
  const body = await req.json();
  const { username, imageUrl } = body;

  try {
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });
    if (!user) {
      return NextResponse.json({
        message: `User not found.`,
        status: 404,
      });
    }
    const updatedUser = await prisma.user.update({
      where: {
        username,
      },
      data: {
        imageUrl,
      },
    });
    return NextResponse.json({
      message: "User updated successfully!",
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

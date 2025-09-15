import { NextResponse } from "next/server";
import prisma from "../../../../../../prisma/prisma";

export async function GET(request, { params }) {
  const { id } = params;
  try {
    // Fetch users with role USER
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ["ADMIN", "ACCOUNTANT"],
        },
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

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // Find the user by username
    const user = await prisma.user.findUnique({
      where: { username: username },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Check if the provided password matches the stored password
    if (user.password !== password) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    return NextResponse.json({ message: "Login successful", user });
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json({ error: "Failed to login" }, { status: 500 });
  }
}

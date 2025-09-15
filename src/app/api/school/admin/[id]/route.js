import { NextResponse } from "next/server";
import prisma from "../../../../../../prisma/prisma";

export async function PATCH(request, { params }) {
  const { id } = params;
  const { username, password, role, schoolId } = await request.json(); // Extract the fields from the formData

  try {
    // Fetch the existing user
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Update the user with the new data
    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        username,
        password,
        role,
        schoolId,
      },
    });

    return NextResponse.json(
      { message: "User updated successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Failed to update user:", err);
    return NextResponse.json(
      { message: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  const { id } = params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
    });
    return NextResponse.json(user);
  } catch (err) {
    console.error(err);
    throw new Error("Failed to fetch user");
  } finally {
    await prisma.$disconnect();
  }
}

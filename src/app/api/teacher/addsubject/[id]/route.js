import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(request, { params }) {
  const { id } = params;
  const { subjectsToAdd } = await request.json();

  try {
    // Fetch the user by ID
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Directly replace the user's existing subjects with the new subjects
    const updatedSubjectsArray = subjectsToAdd;

    // Update the user's subjects in the database
    await prisma.user.update({
      where: { id: Number(id) },
      data: { subjects: updatedSubjectsArray },
    });

    // Return a success message
    return NextResponse.json(
      { message: "Subjects updated successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    throw new Error("Failed to replace subjects for user");
  } finally {
    await prisma.$disconnect();
  }
}

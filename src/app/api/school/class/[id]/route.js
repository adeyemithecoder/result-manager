import { NextResponse } from "next/server";
import prisma from "../../../../../../prisma/prisma";

// DELETE function for deleting a class
export async function DELETE(request, { params }) {
  const { id } = params;
  const [schoolId, className] = id.split("-");

  try {
    // Fetch the current classes
    const school = await prisma.school.findUnique({
      where: { id: Number(schoolId) },
      select: { classes: true },
    });

    if (!school) {
      return NextResponse.json(
        { message: "School not found" },
        { status: 404 }
      );
    }

    const updatedClasses = school.classes.filter((cls) => cls !== className);

    // Update the school's classes
    await prisma.school.update({
      where: { id: Number(schoolId) },
      data: { classes: updatedClasses },
    });

    return NextResponse.json(
      { message: "Class deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

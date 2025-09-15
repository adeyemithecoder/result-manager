import { NextResponse } from "next/server";
import prisma from "../../../../../prisma/prisma";
import { deleteImage } from "@/utils/deleteFile";

export async function GET(request, { params }) {
  const { id } = params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
    });
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch user by id" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const { id } = params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
    });
    console.log(user);
    if (user && user.imageUrl) {
      await deleteImage(user.imageUrl);
    }

    await prisma.user.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error delete user:", error);
    return NextResponse.json(
      { error: "Failed to delete students by class" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  const { id } = params;
  const { newSubjects, newClasses, otherFields } = await request.json();
  console.log("records=", newSubjects, newClasses, otherFields);
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Merge and deduplicate classes and subjects
    const updatedClasses = [...new Set([...user.classes, ...newClasses])];
    const updatedSubjects = [...new Set([...user.subjects, ...newSubjects])];

    console.log(updatedClasses);
    console.log(updatedSubjects);

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        ...otherFields,
        classes: updatedClasses,
        subjects: updatedSubjects,
      },
    });
    return NextResponse.json(
      { message: "User updated successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.log(err);
    throw new Error("Failed to update user");
  }
}

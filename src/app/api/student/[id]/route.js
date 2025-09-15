import { NextResponse } from "next/server";
import prisma from "../../../../../prisma/prisma";
import { deleteImage } from "@/utils/deleteFile";

export async function PATCH(request, { params }) {
  const { id } = params;
  const { newData } = await request.json();
  console.log(newData);
  try {
    const updatedStudent = await prisma.student.update({
      where: { id: Number(id) },
      data: newData,
    });
    return NextResponse.json(
      { message: "Student updated successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.log(err);
    throw new Error("Failed to update student");
  } finally {
    await prisma.$disconnect();
  }
}
export async function GET(request, { params }) {
  const { id } = params;
  try {
    const student = await prisma.student.findUnique({
      where: { id: Number(id) },
    });
    return NextResponse.json(student);
  } catch (error) {
    console.error("Error fetching student:", error);
    return NextResponse.json(
      { error: "Failed to fetch student" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const { id } = params;

  try {
    const student = await prisma.student.findUnique({
      where: { id: Number(id) },
    });

    if (student && student.image) {
      await deleteImage(student.image);
    }
    await prisma.student.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json(
      { message: "Student deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 }
    );
  }
}

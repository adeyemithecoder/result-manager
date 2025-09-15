import { NextResponse } from "next/server";
import prisma from "../../../../../prisma/prisma";
import { deleteImages } from "@/utils/deleteFile";

export async function GET(request, { params }) {
  const { id } = params;
  console.log(id);

  // Validate required fields
  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  try {
    // Fetch assignments based on the single id
    const assignments = await prisma.assignment.findMany({
      where: {
        teacherId: Number(id),
      },
      select: {
        id: true,
        title: true,
        level: true,
        instructions: true,
        givenDate: true,
        submissionDate: true,
        questions: true,
        teacherName: true,
        schoolId: true,
        images: true,
        scores: true,
      },
    });
    console.log(assignments);
    return NextResponse.json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments by ID" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const { id } = params;

  try {
    // Fetch the assignment and all related student tasks
    const assignment = await prisma.assignment.findUnique({
      where: { id: Number(id) },
      include: {
        studentTasks: true,
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Collect all images from the assignment and student tasks
    const allImages = [
      ...assignment.images,
      ...assignment.studentTasks.flatMap((task) => task.images),
    ];

    if (allImages.length > 0) {
      await deleteImages(allImages);
    }

    await prisma.assignment.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json(
      { message: "Assignment and associated images deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting assignment:", error);

    return NextResponse.json(
      { error: "Failed to delete assignment" },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const body = await req.json();
    const {
      title,
      instructions,
      givenDate,
      submissionDate,
      questions,
      teacherId,
      teacherName,
      schoolId,
      level,
      scores,
    } = body;

    const { id } = params;

    if (
      !id ||
      !title ||
      !instructions ||
      !givenDate ||
      !submissionDate ||
      !teacherId ||
      !teacherName ||
      !schoolId ||
      !scores ||
      !level
    ) {
      return new NextResponse(
        JSON.stringify({
          message: "Some required fields are missing.",
        })
      );
    }
    console.log(scores);
    // Update the existing assignment in the database
    const updatedAssignment = await prisma.assignment.update({
      where: {
        id: Number(id),
      },
      data: {
        title,
        instructions,
        givenDate: new Date(givenDate),
        submissionDate: new Date(submissionDate),
        questions,
        teacherId,
        teacherName,
        schoolId: Number(schoolId),
        scores,
        level,
      },
    });

    return new NextResponse(
      JSON.stringify({
        message: "Assignment updated successfully!",
        data: updatedAssignment,
        status: 200,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Error updating assignment:", err);

    return new NextResponse(
      JSON.stringify({
        message: "Failed to update assignment",
        status: 500,
      }),
      { status: 500 }
    );
  }
}

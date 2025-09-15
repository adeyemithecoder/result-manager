import { NextResponse } from "next/server";
import prisma from "../../../../prisma/prisma";

export async function POST(req) {
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
      images,
      scores,
    } = body;
    console.log(scores);
    // Check if all required fields are present
    if (
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
          status: 400,
        })
      );
    }

    const checkScores = scores && Array.isArray(scores) ? scores : [];

    // Create the assignment in the database
    const newAssignment = await prisma.assignment.create({
      data: {
        title,
        instructions,
        givenDate: new Date(givenDate),
        submissionDate: new Date(submissionDate),
        questions,
        images,
        teacherId,
        teacherName,
        schoolId: Number(schoolId),
        level,
        scores: checkScores,
      },
    });

    return new NextResponse(
      JSON.stringify({
        message: "Assignment created successfully!",
        data: newAssignment,
        status: 201,
      }),
      { status: 201 }
    );
  } catch (err) {
    console.error("Error creating assignment:", err);

    return new NextResponse(
      JSON.stringify({
        message: "Failed to create assignment",
        error: err.message,
        status: 500,
      }),
      { status: 500 }
    );
  }
}

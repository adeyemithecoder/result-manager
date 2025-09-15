import { NextResponse } from "next/server";
import prisma from "../../../../../prisma/prisma";

export async function POST(req) {
  try {
    const body = await req.json();
    const { assignmentId, studentId, images, submission, submittedDate } = body;
    console.log(images);
    if (!assignmentId || !studentId || !submission) {
      return new NextResponse(
        JSON.stringify({
          message: "Missing required fields",
          status: 400,
        })
      );
    }

    // Corrected version of finding unique assignment submission
    const existingSubmission = await prisma.studentTask.findUnique({
      where: {
        unique_assignment_per_student: {
          assignmentId,
          studentId,
        },
      },
    });

    if (existingSubmission) {
      return new NextResponse(
        JSON.stringify({
          message: "Assignment already submitted",
          status: 400,
        })
      );
    }

    const newSubmission = await prisma.studentTask.create({
      data: {
        assignmentId,
        submittedDate,
        studentId,
        status: "SUBMITTED",
        images,
        submission,
      },
    });

    return new NextResponse(
      JSON.stringify({
        message: "Assignment submitted successfully!",
        data: newSubmission,
        status: 201,
      })
    );
  } catch (err) {
    console.error("Error submitting assignment:", err);

    return new NextResponse(
      JSON.stringify({
        message: "Failed to submit assignment",
        error: err.message,
        status: 500,
      }),
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  const { scores } = await request.json();

  // Validate input
  if (!Array.isArray(scores) || scores.length === 0) {
    return new NextResponse(
      JSON.stringify({ message: "No scores provided", status: 400 }),
      { status: 400 }
    );
  }

  try {
    // Iterate through each submission and its scores
    for (const { id, scoreArray } of scores) {
      // Validate score array
      if (
        !Array.isArray(scoreArray) ||
        scoreArray.some((score) => score < 0 || score > 100)
      ) {
        return new NextResponse(
          JSON.stringify({
            message: `Invalid score for student task ID ${id}. All scores must be between 0 and 100.`,
            status: 400,
          })
        );
      }

      // Update the scores array in the database
      await prisma.studentTask.update({
        where: { id: Number(id) },
        data: { scores: scoreArray }, // Now updating scores as an array
      });
    }

    return new NextResponse(
      JSON.stringify({ message: "Scores updated successfully", status: 200 }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Error updating scores:", err);
    return new NextResponse(
      JSON.stringify({
        message: "Failed to update scores",
        error: err.message,
        status: 500,
      }),
      { status: 500 }
    );
  }
}

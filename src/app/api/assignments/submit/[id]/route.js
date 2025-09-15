import { NextResponse } from "next/server";
import prisma from "../../../../../../prisma/prisma";

export async function GET(request, { params }) {
  const { id } = params;
  console.log(id);

  if (!id) {
    return new NextResponse(
      JSON.stringify({
        message: "Missing id",
        status: 400,
      })
    );
  }

  try {
    // Fetch the unique assignment based on the id
    const assignment = await prisma.assignment.findUnique({
      where: { id: Number(id) },
    });

    // Fetch all submissions for the assignment
    const submissions = await prisma.studentTask.findMany({
      where: { assignmentId: Number(id) },
      include: { student: true },
    });

    // Check if the assignment exists
    if (!assignment) {
      return new NextResponse(
        JSON.stringify({
          message: "Assignment not found",
          status: 404,
        })
      );
    }
    console.log(submissions);
    // Return both the unique assignment and its submissions
    return NextResponse.json({
      assignment,
      submissions,
    });
  } catch (err) {
    console.error("Error fetching assignment or submissions:", err);

    return new NextResponse(
      JSON.stringify({
        message: "Failed to fetch assignment or submissions",
        error: err.message,
        status: 500,
      })
    );
  }
}

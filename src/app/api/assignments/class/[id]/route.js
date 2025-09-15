import { NextResponse } from "next/server";
import prisma from "../../../../../../prisma/prisma";

export async function GET(request, { params }) {
  const { id } = params;
  const [schoolId, level, studentId] = id.split("-");

  if (!level || !schoolId) {
    return NextResponse.json(
      { error: "School ID and level are required" },
      { status: 400 }
    );
  }

  try {
    // Build the level string with or without the variant

    // Build the where clause for querying assignments
    const whereClause = {
      schoolId: Number(schoolId),
      level: level,
    };
    // Fetch assignments based on schoolId and level (with or without variant)
    const assignments = await prisma.assignment.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        description: true,
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

    const assignmentsWithScore = await Promise.all(
      assignments.map(async (assignment) => {
        const existingSubmission = await prisma.studentTask.findUnique({
          where: {
            unique_assignment_per_student: {
              assignmentId: assignment.id,
              studentId: Number(studentId),
            },
          },
          select: {
            scores: true,
            submission: true,
            status: true,
            images: true,
            submittedDate: true,
          },
        });
        console.log(existingSubmission);
        return {
          ...assignment,
          studentScore: existingSubmission?.scores || null,
          studentSubmission: existingSubmission?.submission || [],
          images: existingSubmission?.images,
          submittedDate: existingSubmission?.submittedDate,
          submissionStatus: existingSubmission?.status || "PENDING",
        };
      })
    );
    console.log(assignmentsWithScore);
    return NextResponse.json(assignmentsWithScore);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments by schoolId and level" },
      { status: 500 }
    );
  }
}

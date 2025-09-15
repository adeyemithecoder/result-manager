import { NextResponse } from "next/server";
import prisma from "../../../../prisma/prisma";

export async function POST(req) {
  const body = await req.json();
  const { className, subjectName, variant, schoolId, academicYear } = body;

  // List of all terms you want to update
  const termTypes = ["FIRST", "SECOND", "THIRD"];

  try {
    // Find all students in the specified class and school
    const students = await prisma.student.findMany({
      where: {
        level: className,
        academicYear: academicYear,
        schoolId: Number(schoolId),
        ...(variant && { variant }),
      },
    });

    // Iterate over each student and update their term results
    for (const student of students) {
      for (const termType of termTypes) {
        // Check if the term result exists for the student
        let termResult = await prisma.term.findFirst({
          where: {
            studentId: student.id,
            termType: termType,
          },
        });

        if (termResult) {
          // Check if the subject already exists for the student in the specified term
          const subjectExists = await prisma.subject.findFirst({
            where: {
              termId: termResult.id,
              subjectName: subjectName,
            },
          });

          if (!subjectExists) {
            // Update the term result to add the new subject if it doesn't exist
            await prisma.term.update({
              where: { id: termResult.id },
              data: {
                subjects: {
                  create: {
                    subjectName: subjectName,
                  },
                },
              },
            });
          }
        } else {
          console.log(`Creating term result for ${termType}...`);
          await prisma.term.create({
            data: {
              studentId: student.id,
              termType: termType,
              subjects: {
                create: {
                  subjectName: subjectName,
                },
              },
            },
          });
        }
      }
    }

    return new NextResponse(
      JSON.stringify({
        message: "Subject added to all terms at once.",
        status: 200,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error adding subject to all terms:", error);
    return new NextResponse(
      JSON.stringify({
        error: "Error adding subject to all terms",
        status: 500,
      }),
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  const body = await req.json();
  const { className, subjectName, variant, schoolId, academicYear } = body;

  const termTypes = ["FIRST", "SECOND", "THIRD"];
  try {
    const students = await prisma.student.findMany({
      where: {
        level: className,
        academicYear: academicYear,
        schoolId: Number(schoolId),
        ...(variant && { variant }), // Only include the variant filter if variant is defined
      },
    });
    for (const student of students) {
      for (const termType of termTypes) {
        // Check if the term result exists for the student
        let termResult = await prisma.term.findFirst({
          where: {
            studentId: student.id,
            termType: termType,
          },
        });

        if (termResult) {
          // Check if the subject exists for the student in the specified term
          const subjectExists = await prisma.subject.findFirst({
            where: {
              termId: termResult.id,
              subjectName,
            },
          });

          if (subjectExists) {
            // Delete the subject from the student's term result
            await prisma.subject.delete({
              where: { id: subjectExists.id },
            });

            // Optionally, if all subjects have been removed, delete the term result
            const remainingSubjects = await prisma.subject.findMany({
              where: { termId: termResult.id },
            });

            if (remainingSubjects.length === 0) {
              await prisma.term.delete({
                where: { id: termResult.id },
              });
            }
          }
        }
      }
    }

    return new NextResponse(
      JSON.stringify({
        message: "Subject removed from all terms successfully",
        status: 200,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing subject from all terms:", error);
    return new NextResponse(
      JSON.stringify({
        error: "Error removing subject from all terms",
        status: 500,
      }),
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  const body = await req.json();
  const {
    className,
    variant,
    schoolId,
    academicYear,
    currentSubjectName,
    newSubjectName,
  } = body;

  const termTypes = ["FIRST", "SECOND", "THIRD"];

  try {
    // Find all students in the specified class and school
    const students = await prisma.student.findMany({
      where: {
        level: className,
        academicYear: academicYear,
        schoolId: Number(schoolId),
        ...(variant && { variant }), // Only include the variant filter if variant is defined
      },
    });

    // Iterate over each student and update their term results
    for (const student of students) {
      for (const termType of termTypes) {
        // Find the term result for the student
        const termResult = await prisma.term.findFirst({
          where: {
            studentId: student.id,
            termType: termType,
          },
        });

        if (termResult) {
          // Check if the current subject exists in the term
          const subjectExists = await prisma.subject.findFirst({
            where: {
              termId: termResult.id,
              subjectName: currentSubjectName,
            },
          });

          if (subjectExists) {
            // Update the subject name
            await prisma.subject.update({
              where: { id: subjectExists.id },
              data: {
                subjectName: newSubjectName,
              },
            });
          }
        }
      }
    }

    return new NextResponse(
      JSON.stringify({
        message: "Subject name updated successfully.",
        status: 200,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating subject name:", error);
    return new NextResponse(
      JSON.stringify({
        error: "Error updating subject name",
        status: 500,
      }),
      { status: 500 }
    );
  }
}

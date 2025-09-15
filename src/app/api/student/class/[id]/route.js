import { NextResponse } from "next/server";
import prisma from "../../../../../../prisma/prisma";

export async function PATCH(request, { params }) {
  const { id } = params;
  const { termType, records } = await request.json();

  try {
    for (const { studentId, record } of records) {
      if (!record.subjectName) {
        console.error(
          `Subject name is required in the record object for student ${studentId}.`
        );
        continue;
      }

      const student = await prisma.student.findUnique({
        where: { id: Number(studentId) },
      });
      if (!student) {
        console.error(`Student with ID ${studentId} not found`);
        continue;
      }

      let termResult = await prisma.term.findFirst({
        where: { studentId: Number(studentId), termType },
        include: { subjects: true },
      });
      if (!termResult) {
        termResult = await prisma.term.create({
          data: {
            studentId: Number(studentId),
            termType,
            subjects: {
              create: {
                subjectName: record.subjectName,
                firstCA: record.scores.firstCA,
                secondCA: record.scores.secondCA,
                thirdCA: record.scores.thirdCA,
                fourthCA: record.scores.fourthCA,
                fifthCA: record.scores.fifthCA,
                sixthCA: record.scores.sixthCA,
                assignment: record.scores.assignment,
                project: record.scores.project,
                note: record.scores.note,
                rt: record.scores.rt,
                affective: record.scores.affective,
                exam: record.scores.exam,
              },
            },
          },
        });
      } else {
        const subjectIndex = termResult.subjects.findIndex(
          (subject) => subject.subjectName === record.subjectName
        );

        if (subjectIndex !== -1) {
          const existingSubject = termResult.subjects[subjectIndex];
          await prisma.subject.update({
            where: { id: existingSubject.id },
            data: {
              firstCA: record.scores.firstCA ?? existingSubject.firstCA,
              secondCA: record.scores.secondCA ?? existingSubject.secondCA,
              thirdCA: record.scores.thirdCA ?? existingSubject.thirdCA,
              fourthCA: record.scores.fourthCA ?? existingSubject.fourthCA,
              fifthCA: record.scores.fifthCA ?? existingSubject.fifthCA,
              sixthCA: record.scores.sixthCA ?? existingSubject.sixthCA,
              assignment:
                record.scores.assignment ?? existingSubject.assignment,
              project: record.scores.project ?? existingSubject.project,
              note: record.scores.note ?? existingSubject.note,
              affective: record.scores.affective ?? existingSubject.affective,
              rt: record.scores.rt ?? existingSubject.rt,
              exam: record.scores.exam ?? existingSubject.exam,
            },
          });
        } else {
          await prisma.subject.create({
            data: {
              subjectName: record.subjectName,
              firstCA: record.scores.firstCA,
              secondCA: record.scores.secondCA,
              thirdCA: record.scores.thirdCA,
              fourthCA: record.scores.fourthCA,
              fifthCA: record.scores.fifthCA,
              sixthCA: record.scores.sixthCA,
              assignment: record.scores.assignment,
              project: record.scores.project,
              note: record.scores.note,
              rt: record.scores.rt,
              affective: record.scores.affective,
              exam: record.scores.exam,
              termId: termResult.id,
            },
          });
        }
      }
    }
    return NextResponse.json(
      { message: "Data updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error adding or updating data to term:", error);
    throw error;
  }
}

export async function PUT(request) {
  try {
    // Parse the request body
    const { updates } = await request.json();
    console.log(updates);
    const testQuery = await prisma.resultAvailability.findFirst();
    console.log(testQuery);

    // Check if there's anything to update
    const filteredUpdates = updates.filter(
      ({ isAvailable, termType, studentId }) =>
        isAvailable !== undefined && termType && studentId
    );
    console.log(filteredUpdates);
    const updatePromises = filteredUpdates.map(
      async ({ studentId, termType, isAvailable }) => {
        return prisma.resultAvailability.upsert({
          where: {
            // Use the `unique_student_term_result_availability` constraint directly
            unique_student_term_result_availability: {
              studentId: Number(studentId),
              termType,
            },
          },
          update: {
            available: isAvailable,
          },
          create: {
            studentId: Number(studentId),
            termType,
            available: isAvailable,
          },
        });
      }
    );
    await Promise.all(updatePromises);

    // Return a successful response
    return NextResponse.json(
      { message: "Result availability updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating student result availability:", error);
    return NextResponse.json(
      { error: "Failed to update result availability" },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  const { id } = params;
  const [termType, schoolId, encodedAcademicYear, level, variant] =
    id.split("-");
  const academicYear = decodeURIComponent(encodedAcademicYear);
  if (!level || !schoolId || !termType || !academicYear) {
    return NextResponse.json(
      { error: "Level, School ID, and termType are required" },
      { status: 400 }
    );
  }

  try {
    let whereClause = {
      level: level,
      schoolId: Number(schoolId),
      academicYear,
    };
    if (variant) {
      whereClause.variant = variant;
    }

    const studentsWithResults = await prisma.student.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        surname: true,
        level: true,
        image: true,
        variant: true,
        gender: true,
        resultAvailability: true,
        password: true,
        username: true,
        attendanceList: true,
      },
    });

    return NextResponse.json(studentsWithResults);
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students by class" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import prisma from "../../../../../../prisma/prisma";

export async function DELETE(request, { params }) {
  const { id } = params;
  {
    const [schoolId, subjectName] = id.split("-");
    console.log(schoolId, subjectName);
    console.log(subjectName);
    try {
      // Fetch the current subjects
      const school = await prisma.school.findUnique({
        where: { id: Number(schoolId) },
        select: { subjects: true },
      });
      console.log(school);
      if (!school) {
        return NextResponse.json(
          { message: "School not found" },
          { status: 200 }
        );
      } else {
        console.log("first");
        const updatedSubjects = school.subjects.filter(
          (subject) => subject !== subjectName
        );
        // Update the school's subjects
        await prisma.school.update({
          where: { id: Number(schoolId) },
          data: { subjects: updatedSubjects },
        });

        return NextResponse.json(
          { message: "Subject deleted successfully" },
          { status: 200 }
        );
      }
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { message: "Internal Server Error" },
        { status: 200 }
      );
    }
  }
}

import { NextResponse } from "next/server";
import prisma from "../../../../../../prisma/prisma";

export async function PATCH(request, { params }) {
  const { id } = params;
  const { classesToAdd } = await request.json();
  console.log(Number(id), classesToAdd);

  try {
    // Fetch the user by ID
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Directly replace the user's existing classes with the new classes
    const updatedClassesArray = classesToAdd;

    // Update the user's classes in the database
    await prisma.user.update({
      where: { id: Number(id) },
      data: { classes: updatedClassesArray },
    });

    // Return a success message
    return NextResponse.json(
      { message: "Classes updated successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    throw new Error("Failed to replace classes for user");
  }
}

export async function PUT(request, { params }) {
  const { id } = params;
  const { classesToAdd } = await request.json();
  console.log(Number(id), classesToAdd);

  try {
    // Fetch the user by ID
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Directly replace the teacher's existing classes with the new classes
    const updatedClassesArray = classesToAdd;

    // Update the user's teacherOf classes in the database
    await prisma.user.update({
      where: { id: Number(id) },
      data: { teacherOf: updatedClassesArray },
    });

    // Return a success message
    return NextResponse.json(
      { message: "Classes updated successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    throw new Error("Failed to replace classes for user");
  }
}

// export async function PATCH(request, { params }) {
//   const { id } = params;
//   const { classesToAdd } = await request.json();
//   console.log(Number(id), classesToAdd);
//   try {
//     // Fetch the user by ID
//     const user = await prisma.user.findUnique({
//       where: { id: Number(id) },
//     });

//     if (!user) {
//       throw new Error("User not found");
//     }

//     // Add the new classes to the user's classes array, ensuring no duplicates
//     const updatedClasses = new Set([...user.classes, ...classesToAdd]);
//     const updatedClassesArray = Array.from(updatedClasses);
//     // Update the user's classes in the database
//     await prisma.user.update({
//       where: { id: Number(id) },
//       data: { classes: updatedClassesArray },
//     });
//     // Return a success message
//     return NextResponse.json(
//       { message: "Class Added Successfully" },
//       { status: 200 }
//     );
//   } catch (err) {
//     console.error(err);
//     throw new Error("Failed to add classes to user");
//   }
// }
// export async function PUT(request, { params }) {
//   const { id } = params;
//   const { classesToAdd } = await request.json();
//   console.log(Number(id), classesToAdd);
//   try {
//     // Fetch the user by ID
//     const user = await prisma.user.findUnique({
//       where: { id: Number(id) },
//     });

//     if (!user) {
//       throw new Error("User not found");
//     }

//     // Add the new classes to the user's classes array, ensuring no duplicates
//     const updatedClasses = new Set([...user.teacherOf, ...classesToAdd]);
//     const updatedClassesArray = Array.from(updatedClasses);
//     // Update the user's classes in the database
//     await prisma.user.update({
//       where: { id: Number(id) },
//       data: { teacherOf: updatedClassesArray },
//     });
//     // Return a success message
//     return NextResponse.json(
//       { message: "Class Added Successfully" },
//       { status: 200 }
//     );
//   } catch (err) {
//     console.error(err);
//     throw new Error("Failed to add classes to user");
//   }
// }

// export async function PUT(request, { params }) {
//   const { id } = params;
//   const { classesToAdd } = await request.json();
//   console.log(classesToAdd);
//   try {
//     // Fetch the user by ID
//     const user = await prisma.user.findUnique({
//       where: { id: Number(id) },
//     });

//     if (!user) {
//       throw new Error("User not found");
//     }

//     // Ensure teacherOf is an array and add the new class if it's not already present
//     const updatedTeacherOf = Array.isArray(user.teacherOf)
//       ? [...user.teacherOf]
//       : [];

//     // Filter out undefined values and add the new class
//     const filteredTeacherOf = updatedTeacherOf.filter(Boolean);
//     console.log(filteredTeacherOf);
//     if (classesToAdd && !filteredTeacherOf.includes(classesToAdd)) {
//       filteredTeacherOf.push(classesToAdd);
//     }

//     // Update the user's teacherOf field with the new array
//     const updatedUser = await prisma.user.update({
//       where: { id: Number(id) },
//       data: { teacherOf: filteredTeacherOf },
//     });

//     return NextResponse.json(
//       { message: "Class Added Successfully" },
//       { status: 200 }
//     );
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json(
//       { message: "Failed to add class to teacherOf", error: err.message },
//       { status: 500 }
//     );
//   }
// }

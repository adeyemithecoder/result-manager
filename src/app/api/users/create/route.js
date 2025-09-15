import { NextResponse } from "next/server";
import prisma from "../../../../../prisma/prisma";

export async function POST(req) {
  const body = await req.json();
  const { username, name, gender, password, role, schoolId } = body;
  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        username,
      },
    });
    if (!schoolId) {
      return new NextResponse(
        JSON.stringify({
          message: "SchoolId is missing.",
          status: 409,
        })
      );
    }
    if (existingUser) {
      return new NextResponse(
        JSON.stringify({
          message: `User with ${existingUser.username} already exists!`,
          status: 409,
        })
      );
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        gender,
        username,
        password,
        role,
        schoolId: role === "SUPER_ADMIN" ? null : Number(schoolId),
      },
    });
    return new NextResponse(
      JSON.stringify({
        message: "User created successfully!",
        status: 201,
      })
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return new NextResponse(
      JSON.stringify({
        error: "Failed to create user",
        status: 500,
      })
    );
  }
}

export async function GET(request) {
  const allUsers = await prisma.user.findMany();
  return NextResponse.json(allUsers, { status: 200 });
}

// import { NextResponse } from "next/server";
// import prisma from "../../../../../prisma/prisma";

// export async function POST(req) {
//   const body = await req.json();
//   const { username, password } = body;
//   try {
//     const existingUser = await prisma.user.findUnique({
//       where: {
//         username,
//       },
//     });
//     if (existingUser) {
//       return new NextResponse(
//         JSON.stringify({
//           message: `User with ${existingUser.username} already exist.`,
//           status: 409,
//         })
//       );
//     }
//     const newUser = await prisma.user.create({
//       data: {
//         username,
//         password,
//       },
//     });
//     return new NextResponse(
//       JSON.stringify({
//         message: "User created successfully!",
//         status: 201,
//       })
//     );
//   } catch (error) {
//     return NextResponse.json(
//       { error: "Failed to create user" },
//       { status: 500 }
//     );
//   }
// }

// export async function GET(request) {
//   const allUsers = await prisma.user.findMany();
//   return NextResponse.json(allUsers, { status: 200 });
// }

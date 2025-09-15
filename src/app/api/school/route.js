import { NextResponse } from "next/server";
import prisma from "../../../../prisma/prisma";

export async function GET() {
  const allSchools = await prisma.school.findMany();
  return NextResponse.json(allSchools, { status: 200 });
}

export async function POST(req) {
  const body = await req.json();
  const {
    name,
    fullName,
    address,
    motto,
    contactEmail,
    phoneNumber,
    headmaster,
    principal,
  } = body;

  try {
    const newSchool = await prisma.school.create({
      data: {
        name,
        fullName,
        address,
        principal,
        contactEmail,
        headmaster,
        phoneNumber,
        motto,
        logo: "",
      },
    });

    return new NextResponse(
      JSON.stringify({
        message: "School created successfully",
        status: 201,
        data: newSchool,
      })
    );
  } catch (err) {
    console.error(err);
    throw new Error("Failed to create school!!!");
  }
}

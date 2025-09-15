// File: /api/school/fees/route.ts

import { NextResponse } from "next/server";
import prisma from "../../../../prisma/prisma";

export async function POST(req) {
  try {
    const data = await req.json();
    const { schoolId, fees } = data;

    if (!schoolId || !Array.isArray(fees)) {
      return NextResponse.json(
        { message: "Missing schoolId or invalid fees array" },
        { status: 400 }
      );
    }

    for (const fee of fees) {
      if (!fee.name || fee.price == null) {
        return NextResponse.json(
          { message: "Each fee item must include name and price" },
          { status: 400 }
        );
      }
    }

    const results = await Promise.all(
      fees.map(async (fee) => {
        return prisma.feeItem.upsert({
          where: {
            name_schoolId: {
              name: fee.name,
              schoolId: Number(schoolId),
            },
          },
          update: {
            price: fee.price,
          },
          create: {
            name: fee.name,
            price: fee.price,
            schoolId: Number(schoolId),
          },
        });
      })
    );

    return NextResponse.json(
      { message: "Fees processed", fees: results },
      { status: 201 }
    );
  } catch (error) {
    console.error("School Fees POST Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const schoolId = searchParams.get("schoolId");

    if (!schoolId) {
      return NextResponse.json(
        { message: "Missing schoolId query parameter" },
        { status: 400 }
      );
    }

    const fees = await prisma.feeItem.findMany({
      where: {
        schoolId: Number(schoolId),
      },
    });

    return NextResponse.json(fees, { status: 200 });
  } catch (error) {
    console.error("School Fees GET Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const data = await req.json();
    const { schoolId } = data;
    console.log(schoolId);
    if (!schoolId) {
      return NextResponse.json(
        { message: "Missing schoolId" },
        { status: 400 }
      );
    }
    const deleted = await prisma.feeItem.deleteMany({
      where: {
        schoolId: Number(schoolId),
      },
    });
    console.log("All fee items deleted");
    return NextResponse.json(
      { message: "All fee items deleted", deletedCount: deleted.count },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fee DELETE Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

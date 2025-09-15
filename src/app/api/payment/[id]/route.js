import { NextResponse } from "next/server";
import prisma from "../../../../../prisma/prisma";

export async function GET(request, { params }) {
  try {
    const [studentIdStr, termType] = params.id.split("-");
    const studentId = Number(studentIdStr);

    if (!studentId || !termType) {
      return NextResponse.json(
        { message: "Invalid or missing student ID / term type" },
        { status: 400 }
      );
    }

    // Fetch student
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        name: true,
        surname: true,
        level: true,
        variant: true,
        schoolId: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
    }

    // Fetch fees for the school
    const fees = await prisma.feeItem.findMany({
      where: { schoolId: student.schoolId },
    });

    const feeMap = fees.reduce((acc, fee) => {
      acc[fee.name] = fee.price;
      return acc;
    }, {});

    // Initialize student data
    const studentData = {
      student,
      remark: null,
      paidAmount: 0,
      expectedFee: 0,
      payable: 0,
      balance: 0,
      items: [],
      collectedItems: new Set(),
    };

    // Add core fees
    for (const core of ["Tuition fee", "School lesson"]) {
      if (!studentData.collectedItems.has(core)) {
        studentData.expectedFee += feeMap[core] || 0;
        studentData.payable += feeMap[core] || 0;
        studentData.collectedItems.add(core);
      }
    }

    // Fetch payments for this student in the selected term
    const payments = await prisma.payment.findMany({
      where: {
        termType,
        studentId: student.id,
      },
      include: {
        items: true,
      },
    });

    // Apply payments
    for (const payment of payments) {
      studentData.remark = payment.remark || studentData.remark;

      for (const item of payment.items) {
        const { type, amount = 0 } = item;

        if (type === "Tuition fee" || type === "School lesson") {
          // Already handled
        } else if (type === "Discount") {
          studentData.expectedFee -= amount;
          studentData.payable -= amount;
        } else {
          if (!studentData.collectedItems.has(type)) {
            studentData.collectedItems.add(type);
            studentData.payable += feeMap[type] || amount;
          } else {
            studentData.payable += amount;
          }
        }

        if (type !== "Discount") {
          studentData.paidAmount += amount;
        }

        studentData.items.push({
          type,
          amount,
          id: item.id,
          date: item.date,
          method: item.method,
        });
      }
    }

    studentData.balance = studentData.payable - studentData.paidAmount;

    // Cleanup
    delete studentData.collectedItems;

    return NextResponse.json(studentData);
  } catch (error) {
    console.error("Single Student Fetch Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

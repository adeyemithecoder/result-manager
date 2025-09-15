import { NextResponse } from "next/server";
import prisma from "../../../../prisma/prisma";

export async function POST(req) {
  try {
    const data = await req.json();
    const { studentId, termType, items, remark, schoolId } = data;

    if (!studentId || !termType || !schoolId) {
      return NextResponse.json(
        { message: "Missing studentId, termType, or schoolId" },
        { status: 400 }
      );
    }

    const EXCLUDED_ITEMS = ["Previous term outstanding", "Discount"];

    // ✅ Validate item structure
    if (items?.length) {
      for (const item of items) {
        const isExcluded = EXCLUDED_ITEMS.includes(item.type);
        if (!item.type || item.amount == null) {
          return NextResponse.json(
            { message: "Each item must include type and amount" },
            { status: 400 }
          );
        }
        if (!isExcluded && (!item.date || !item.method)) {
          return NextResponse.json(
            { message: `Item '${item.type}' must include date and method` },
            { status: 400 }
          );
        }
      }
    }

    const fees = await prisma.feeItem.findMany({
      where: { schoolId: Number(schoolId) },
    });

    const feeMap = fees.reduce((acc, fee) => {
      acc[fee.name] = fee.price;
      return acc;
    }, {});

    let payment = await prisma.payment.findUnique({
      where: {
        studentId_termType: {
          studentId,
          termType,
        },
      },
      include: { items: true },
    });

    const existingPaymentsByType = {};
    if (payment?.items?.length) {
      for (const paidItem of payment.items) {
        existingPaymentsByType[paidItem.type] =
          (existingPaymentsByType[paidItem.type] || 0) + paidItem.amount;
      }
    }

    // ✅ Only validate payment amount limits for non-excluded items
    if (items?.length) {
      for (const item of items) {
        const isExcluded = EXCLUDED_ITEMS.includes(item.type);
        if (isExcluded) continue;

        const maxAmount = feeMap[item.type];
        if (maxAmount == null) {
          return NextResponse.json(
            {
              message: `Item type '${item.type}' is not defined in the fee structure.`,
            },
            { status: 400 }
          );
        }

        const alreadyPaid = existingPaymentsByType[item.type] || 0;
        const newTotal = alreadyPaid + item.amount;
        if (newTotal > maxAmount) {
          return new NextResponse(
            JSON.stringify({
              message: `Total payment for '${item.type}' exceeds allowed amount. Already paid: ${alreadyPaid}, trying to pay: ${item.amount}, max allowed: ${maxAmount}`,
              status: 400,
            })
          );
        }
      }
    }

    if (payment) {
      if (remark !== undefined) {
        await prisma.payment.update({
          where: {
            studentId_termType: {
              studentId,
              termType,
            },
          },
          data: { remark },
        });
      }

      if (items?.length) {
        await prisma.paymentItem.createMany({
          data: items.map((item) => ({
            paymentRecordId: payment.id,
            type: item.type,
            amount: item.amount,
            date: item.date ? new Date(item.date) : undefined,
            method: item.method || undefined,
          })),
        });
      }
    } else {
      if (!items?.length && !remark) {
        return NextResponse.json(
          { message: "Cannot create a payment without items or remark" },
          { status: 400 }
        );
      }

      payment = await prisma.payment.create({
        data: {
          studentId,
          termType,
          remark: remark || undefined,
          items: items?.length
            ? {
                create: items.map((item) => ({
                  type: item.type,
                  amount: item.amount,
                  date: item.date ? new Date(item.date) : undefined,
                  method: item.method || undefined,
                })),
              }
            : undefined,
        },
        include: { items: true },
      });
    }

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error("Create Payment Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const data = await req.json();
    const { studentId, termType, items, remark, schoolId } = data;

    if (!studentId || !termType || !schoolId) {
      return NextResponse.json(
        { message: "Missing studentId, termType, or schoolId" },
        { status: 400 }
      );
    }

    const EXCLUDED_ITEMS = ["Previous term outstanding", "Discount"];

    // ✅ Clean and validate items — amount must exist for ALL
    const cleanedItems = (items || []).filter(
      (item) => item.amount !== null && item.amount !== 0
    );

    // ❌ Validate cleaned items
    for (const item of cleanedItems) {
      if (!item.type || item.amount == null) {
        return NextResponse.json(
          { message: `Each item must include a valid type and amount` },
          { status: 400 }
        );
      }

      // Only regular items (not excluded) must include date/method
      const isExcluded = EXCLUDED_ITEMS.includes(item.type);
      if (!isExcluded && (!item.date || !item.method)) {
        return NextResponse.json(
          { message: `Item '${item.type}' must include date and method` },
          { status: 400 }
        );
      }
    }

    const fees = await prisma.feeItem.findMany({
      where: { schoolId: Number(schoolId) },
    });

    const feeMap = fees.reduce((acc, fee) => {
      acc[fee.name] = fee.price;
      return acc;
    }, {});

    const payment = await prisma.payment.findUnique({
      where: {
        studentId_termType: {
          studentId,
          termType,
        },
      },
      include: { items: true },
    });

    if (!payment) {
      return NextResponse.json(
        {
          message:
            "Payment record not found. Cannot update non-existent record.",
        },
        { status: 404 }
      );
    }

    // 🚮 Always delete old items
    await prisma.paymentItem.deleteMany({
      where: { paymentRecordId: payment.id },
    });

    // 🧮 Validate total amounts by item type
    const newPaymentsByType = {};

    for (const item of cleanedItems) {
      const isExcluded = EXCLUDED_ITEMS.includes(item.type);
      if (isExcluded) continue;

      const maxAmount = feeMap[item.type];
      if (maxAmount == null) {
        return NextResponse.json(
          {
            message: `Item type '${item.type}' is not defined in the fee structure.`,
          },
          { status: 400 }
        );
      }

      newPaymentsByType[item.type] =
        (newPaymentsByType[item.type] || 0) + item.amount;

      if (newPaymentsByType[item.type] > maxAmount) {
        return NextResponse.json(
          {
            message: `Total payment for '${
              item.type
            }' exceeds allowed amount. Trying to pay: ${
              newPaymentsByType[item.type]
            }, max allowed: ${maxAmount}`,
          },
          { status: 400 }
        );
      }
    }

    // 📝 Update remark if provided
    if (remark !== undefined) {
      await prisma.payment.update({
        where: {
          studentId_termType: {
            studentId,
            termType,
          },
        },
        data: { remark },
      });
    }

    // 💾 Recreate only valid items
    if (cleanedItems.length) {
      await prisma.paymentItem.createMany({
        data: cleanedItems.map((item) => ({
          paymentRecordId: payment.id,
          type: item.type,
          amount: item.amount,
          date: item.date ? new Date(item.date) : undefined,
          method: item.method || undefined,
        })),
      });
    }

    return NextResponse.json(
      { message: "Payment items replaced successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update Payment Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const selectedClass = searchParams.get("selectedClass");
    const schoolId = searchParams.get("schoolId");
    const termType = searchParams.get("termType");

    const [level, variant] = selectedClass?.split("-") || [];

    if (!level || !schoolId || !termType) {
      return NextResponse.json(
        { message: "Missing required query parameters" },
        { status: 400 }
      );
    }

    // Fetch all fee items for the school
    const fees = await prisma.feeItem.findMany({
      where: {
        schoolId: Number(schoolId),
      },
    });
    console.log(fees);
    const school = await prisma.school.findUnique({
      where: { id: Number(schoolId) },
    });
    console.log(school.classes);
    // Map fee names to their prices
    const feeMap = fees.reduce((acc, fee) => {
      acc[fee.name] = fee.price;
      return acc;
    }, {});

    // Fetch all students in the selected class
    const students = await prisma.student.findMany({
      where: {
        level,
        variant,
        schoolId: Number(schoolId),
      },
      select: {
        id: true,
        name: true,
        surname: true,
        level: true,
        variant: true,
      },
    });

    // Fetch all payments for these students in the selected term
    const payments = await prisma.payment.findMany({
      where: {
        termType,
        student: {
          level,
          variant,
          schoolId: Number(schoolId),
        },
      },
      include: {
        student: true,
        items: true,
      },
    });

    // Initialize student map
    const studentMap = {};
    for (const student of students) {
      studentMap[student.id] = {
        student,
        remark: null,
        paidAmount: 0,
        expectedFee: 0,
        payable: 0,
        balance: 0,
        items: [],
        collectedItems: new Set(),
      };
      // Dynamically determine tuition fee item name
      let tuitionFeeKey = null;

      if (
        level.startsWith("Grade1") ||
        level.startsWith("Grade2") ||
        level.startsWith("Grade3") ||
        level.startsWith("Grade4")
      ) {
        tuitionFeeKey = "Tuition fee (Grade1 - Grade4)";
      } else if (level.startsWith("Grade5")) {
        tuitionFeeKey = "Tuition fee (Grade5)";
      } else if (level === "JSS 1" || level === "JSS 2") {
        tuitionFeeKey = "Tuition fee (JS1 - JS2)";
      } else if (level === "JSS 3") {
        tuitionFeeKey = "Tuition fee (JS3)";
      } else if (level === "SS 1" || level === "SS 2") {
        tuitionFeeKey = "Tuition fee (SS1 - SS2)";
      } else if (level === "SS 3") {
        tuitionFeeKey = "Tuition fee (SS3)";
      } else if (level === "Reception 1") {
        tuitionFeeKey = "Tuition fee (Reception 1)";
      } else if (level === "Reception 2") {
        tuitionFeeKey = "Tuition fee (Reception 2)";
      } else if (level.startsWith("Nursery1")) {
        tuitionFeeKey = "Tuition fee (Nursery1)";
      } else if (level.startsWith("Nursery2")) {
        tuitionFeeKey = "Tuition fee (Nursery2)";
      }

      if (
        tuitionFeeKey &&
        !studentMap[student.id].collectedItems.has(tuitionFeeKey)
      ) {
        const tuitionFee = feeMap[tuitionFeeKey] || 0;
        studentMap[student.id].expectedFee += tuitionFee;
        studentMap[student.id].payable += tuitionFee;
        studentMap[student.id].collectedItems.add(tuitionFeeKey);
      }
    }

    // Apply payment data
    for (const payment of payments) {
      const studentId = payment.student.id;
      const studentGroup = studentMap[studentId];

      studentGroup.remark = payment.remark || studentGroup.remark;

      for (const item of payment.items) {
        const { type, amount = 0 } = item;

        if (type === "Tuition fee" || type === "School lesson") {
          // Already added in init block
        } else if (type === "Discount") {
          studentGroup.expectedFee -= amount;
          studentGroup.payable -= amount;
        } else {
          if (!studentGroup.collectedItems.has(type)) {
            studentGroup.collectedItems.add(type);
            studentGroup.payable += feeMap[type] || amount;
          }
        }

        const EXCLUDED_PAID_TYPES = ["Discount", "Previous term outstanding"];
        if (!EXCLUDED_PAID_TYPES.includes(type)) {
          studentGroup.paidAmount += amount;
        }

        studentGroup.items.push({
          type,
          amount,
          date: item.date,
          method: item.method,
        });
      }

      studentGroup.balance = studentGroup.payable - studentGroup.paidAmount;
    }

    // Remove helper field
    for (const studentId in studentMap) {
      delete studentMap[studentId].collectedItems;
    }

    return NextResponse.json(Object.values(studentMap));
  } catch (error) {
    console.error("Fetch Payments Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    // Delete all payment records — items will cascade delete
    await prisma.payment.deleteMany({});
    console.log("Deleted");
    return NextResponse.json({ message: "All payments deleted successfully." });
  } catch (error) {
    console.error("Delete All Payments Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

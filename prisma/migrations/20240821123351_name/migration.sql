-- CreateTable
CREATE TABLE "AttendanceList" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "termType" "TermType" NOT NULL,
    "session" TEXT NOT NULL,
    "schoolOpenDays" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "daysAbsent" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "daysPresent" DOUBLE PRECISION NOT NULL DEFAULT 0.0,

    CONSTRAINT "AttendanceList_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceList_studentId_termType_session_key" ON "AttendanceList"("studentId", "termType", "session");

-- AddForeignKey
ALTER TABLE "AttendanceList" ADD CONSTRAINT "AttendanceList_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

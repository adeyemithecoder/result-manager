-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "TermType" AS ENUM ('FIRST', 'SECOND', 'THIRD');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "gender" TEXT,
    "imageUrl" TEXT DEFAULT '',
    "teacherOf" TEXT DEFAULT '',
    "classes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "subjects" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "schoolId" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "School" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT,
    "name" TEXT,
    "principal" TEXT,
    "headmaster" TEXT,
    "address" TEXT,
    "contactEmail" TEXT,
    "motto" TEXT,
    "input" TEXT[],
    "logo" TEXT,
    "phoneNumber" TEXT,
    "classes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "subjects" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TermDate" (
    "id" SERIAL NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "termType" "TermType" NOT NULL,
    "nextTermBegin" TEXT NOT NULL,

    CONSTRAINT "TermDate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" SERIAL NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "level" TEXT NOT NULL,
    "variant" TEXT,
    "gender" TEXT,
    "formTeacherName" TEXT,
    "formTeacherRemark" TEXT,
    "headOfSchoolRemark" TEXT,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" TEXT,
    "registrationNo" TEXT,
    "username" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TraitRating" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "trait" TEXT NOT NULL,
    "rating" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "TraitRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" SERIAL NOT NULL,
    "totalPresent" INTEGER NOT NULL DEFAULT 0,
    "totalAbsent" INTEGER NOT NULL DEFAULT 0,
    "absentDates" TEXT[],
    "presentDates" TEXT[],
    "studentId" INTEGER NOT NULL,
    "termType" "TermType" NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Term" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "termType" "TermType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Term_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" SERIAL NOT NULL,
    "subjectName" TEXT NOT NULL,
    "firstCA" INTEGER,
    "secondCA" INTEGER,
    "thirdCA" INTEGER,
    "fourthCA" INTEGER,
    "fifthCA" INTEGER,
    "sixthCA" INTEGER,
    "project" INTEGER,
    "assignment" INTEGER,
    "exam" INTEGER,
    "termId" INTEGER,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_schoolId_idx" ON "User"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "TermDate_schoolId_termType_key" ON "TermDate"("schoolId", "termType");

-- CreateIndex
CREATE UNIQUE INDEX "Student_username_key" ON "Student"("username");

-- CreateIndex
CREATE INDEX "idx_studentId" ON "TraitRating"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_studentId_termType_key" ON "Attendance"("studentId", "termType");

-- CreateIndex
CREATE INDEX "student_term_index" ON "Term"("studentId", "termType");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_subjectName_termId_key" ON "Subject"("subjectName", "termId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TermDate" ADD CONSTRAINT "TermDate_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TraitRating" ADD CONSTRAINT "TraitRating_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Term" ADD CONSTRAINT "Term_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term"("id") ON DELETE SET NULL ON UPDATE CASCADE;

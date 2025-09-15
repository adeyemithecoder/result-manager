"use client";
import Class from "@/components/Class";
import "./class-report.css";
import { redirect, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Spinner from "@/components/Spinner/Spinner";

const Page = () => {
  const { data: session, status: sessionStatus } = useSession();

  if (sessionStatus == "loading")
    return (
      <h1 className="waitH1">
        <Spinner /> Please wait...
      </h1>
    );
  if (sessionStatus !== "authenticated") redirect("/");

  if (sessionStatus === "loading") {
    return "Loading...";
  }

  return (
    <div className="check-result">
      <h2>This is where to update the student score.</h2>
      <h3>Please select academicYear, term, class, then subject</h3>
      <p>Only your class and your subject will be visible to you.</p>
      <Class />
    </div>
  );
};

export default Page;

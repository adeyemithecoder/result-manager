"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import TaskComponent from "@/components/taskComponent/TaskComponent";
import AnswerAssignment from "@/components/AnswerAss/Answer";
import { format } from "date-fns";
import imageCompression from "browser-image-compression";
import { useUploadThing } from "@/utils/uploadthing";
import Spinner from "@/components/Spinner/Spinner";

const Task = () => {
  const [school, setSchool] = useState({});
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const [studentId, setStudentId] = useState(null);
  const [assignmentId, setAssignmentId] = useState(null);
  const [submission, setSubmission] = useState([]);
  const [input, setInput] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const { startUpload } = useUploadThing("imageUploader");
  const [files, setFiles] = useState([]);

  const scrollRef = useRef();

  // Fetch assignments and school data
  const fetchData = async () => {
    try {
      setLoading(true);
      const storedData = JSON.parse(localStorage.getItem("studentData")) || [];
      setStudentId(storedData.id);
      if (!storedData.id) {
        router.push("/");
        return;
      }
      const schoolRes = await axios.get(`/api/school/${storedData.schoolId}`);
      setSchool(schoolRes.data);
      const ass = await axios.get(
        `/api/assignments/class/${storedData.schoolId}-${storedData.level}-${storedData.id}`
      );
      setAssignments(ass.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  // Handle assignment answering logic
  const handleAnswerAssignment = (id, ass) => {
    setAssignmentId(id);
    const search = ass.find((a) => a.id == id);
    setInput(search.questions);
    setSubmission(new Array(search.questions.length).fill(""));

    scrollRef?.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleAnswerChange = (index, value) => {
    const updatedSubmission = [...submission];
    updatedSubmission[index] = value; // Update the specific answer in the array
    setSubmission(updatedSubmission);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submission.some((answer) => answer.trim() === "")) {
      alert("Please complete all questions before submitting.");
      return;
    }
    try {
      setIsSubmitting(true);
      const submittedDate = format(Date.now(), "EEE, MMM d, yyyy");

      let uploadedImagesUrls = [];
      console.log(files);
      // Check if there are files to upload
      if (files && files.length > 0) {
        // Compress each file individually
        const compressedFiles = await Promise.all(
          files.map(async (file) => {
            let compressedFile = await imageCompression(file, {
              maxSizeMB: 1,
              maxWidthOrHeight: 1024,
              useWebWorker: true,
            });
            while (compressedFile.size > 1 * 1024 * 1024) {
              compressedFile = await imageCompression(compressedFile, {
                maxSizeMB: 1,
                maxWidthOrHeight: 1024,
                useWebWorker: true,
              });
            }
            return compressedFile;
          })
        );
        // Upload each compressed file and get URLs
        for (const compressedFile of compressedFiles) {
          const uploadedImages = await startUpload([compressedFile]); // Upload one at a time
          if (!uploadedImages || uploadedImages.length === 0) {
            alert("Image upload failed. Please try again.");
            setLoading(false);
            return;
          }
          uploadedImagesUrls.push(uploadedImages[0].url); // Append each URL
        }
      }

      const { data } = await axios.post("/api/assignments/submit", {
        assignmentId,
        studentId,
        submission,
        submittedDate,
        images: uploadedImagesUrls,
      });
      alert(data.message);
      setFiles([]);
      setImageUrls([]);
      setAssignmentId(null);
      setSubmission([]);
      await fetchData();
    } catch (err) {
      console.log(err);
      alert("Network error: unable to submit");
    } finally {
      setIsSubmitting(false);
    }
  };
  console.log(assignments);
  return (
    <div>
      {loading ? (
        <h1 className="waitH1"><Spinner /> Please wait for a moment</h1>
      ) : assignments.length === 0 ? (
        <h1 className="waitH1">You have no task.</h1>
      ) : (
        <>
          <TaskComponent
            assignments={assignments}
            handleAnswerAssignment={handleAnswerAssignment}
            school={school}
            teacherPage={false}
            adminPage={false}
          />
          {assignmentId && (
            <AnswerAssignment
              submission={submission}
              handleAnswerChange={handleAnswerChange}
              handleSubmit={handleSubmit}
              scrollRef={scrollRef}
              input={input}
              imageUrls={imageUrls}
              setImageUrls={setImageUrls}
              setFiles={setFiles}
              isSubmitting={isSubmitting}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Task;

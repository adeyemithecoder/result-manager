"use client";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import styles from "./task.module.css";
import { useSession } from "next-auth/react";
import TaskComponent from "@/components/taskComponent/TaskComponent";
import { format } from "date-fns";
import { FileUploaderArray } from "@/utils/FileUploader/FileUploader";
import imageCompression from "browser-image-compression";
import { useUploadThing } from "@/utils/uploadthing";
import { IoCloudUploadOutline } from "react-icons/io5";
import Spinner from "@/components/Spinner/Spinner";

const TeacherTask = () => {
  const [taskDetails, setTaskDetails] = useState({
    instructions: "",
    givenDate: "",
    submissionDate: "",
    type: "",
    questions: [""],
  });
  const [loading, setLoading] = useState(false);
  const [upload, setUpload] = useState(false);
  const { startUpload } = useUploadThing("imageUploader");
  const [selectedClass, setSelectedClass] = useState("");
  const { data: session, status: sessionStatus } = useSession();
  const [selectedSubject, setSelectedSubject] = useState("");
  const [scores, setScores] = useState(
    Array(taskDetails.questions.length).fill("")
  );
  const [editMode, setEditMode] = useState(false);
  const [editAssignmentId, setEditAssignmentId] = useState(null);
  const [editAssignment, setEditAssignment] = useState(null);
  const scrollRef = useRef();
  const [school, setSchool] = useState({});
  const [assignments, setAssignments] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const fetchSchoolData = async () => {
      try {
        const { data } = await axios.get(`/api/school/${session.schoolId}`);
        setSchool(data);
      } catch (error) {
        console.error("Error fetching school data:", error);
      }
    };

    if (session?.schoolId) {
      fetchSchoolData();
      fetchAssignments();
    }
  }, [session]);

  const fetchAssignments = async () => {
    const { data } = await axios.get(`/api/assignments/${session.userId}`);
    setAssignments(data);
  };
  const handleDeleteAssignment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this assignment?"))
      return;
    const { data } = await axios.delete(`/api/assignments/${id}`);
    alert(data.message);
    setAssignments(assignments.filter((ass) => ass.id !== id));
  };
  const handleScoreChange = (index, value) => {
    const updatedScores = [...scores];
    updatedScores[index] = value;
    setScores(updatedScores);
  };

  const handleEditAssignment = (assignment) => {
    setEditMode(true);
    setEditAssignmentId(assignment.id);

    setEditAssignment(assignment);
    scrollRef?.current?.scrollIntoView({ behaviour: "smooth" });

    setTaskDetails({
      instructions: assignment.instructions,
      givenDate: format(new Date(assignment.givenDate), "yyyy-MM-dd"),
      submissionDate: format(new Date(assignment.submissionDate), "yyyy-MM-dd"),
      type: assignment.title.split(" ").pop().toUpperCase(),
      questions: assignment.questions,
    });
    setSelectedClass(assignment.level);
    setScores(assignment.scores || Array(assignment.questions.length).fill(""));
  };

  const generateTitle = () => {
    if (editMode && editAssignmentId) {
      return editAssignment.title || "Assignment Title will appear here";
    }

    if (!editMode && selectedClass && selectedSubject && taskDetails.type) {
      return `${selectedClass} ${selectedSubject} ${taskDetails.type.toLowerCase()}`;
    }

    return "Assignment Title will appear here";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaskDetails({ ...taskDetails, [name]: value });
    if (e.target.tagName === "TEXTAREA") {
      e.target.style.height = "auto";
      e.target.style.height = `${e.target.scrollHeight}px`;
    }
  };

  const handleQuestionChange = (index, value) => {
    const updatedQuestions = [...taskDetails.questions];
    updatedQuestions[index] = value;
    setTaskDetails({ ...taskDetails, questions: updatedQuestions });
    const textArea = document.getElementById(`question-${index}`);
    if (textArea) {
      textArea.style.height = "auto";
      textArea.style.height = `${textArea.scrollHeight}px`;
    }
  };

  const handleSubjectChange = (e) => {
    setSelectedSubject(e.target.value);
  };

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
  };

  const addQuestionField = () => {
    setTaskDetails({
      ...taskDetails,
      questions: [...taskDetails.questions, ""],
    });
  };

  const removeQuestionField = () => {
    if (taskDetails.questions.length > 1) {
      const updatedQuestions = taskDetails.questions.slice(0, -1);
      setTaskDetails({ ...taskDetails, questions: updatedQuestions });
    }
  };

  useEffect(() => {
    const textAreas = document.querySelectorAll("textarea");
    textAreas.forEach((textarea) => {
      textarea.style.height = "auto"; // Reset the height
      textarea.style.height = `${textarea.scrollHeight}px`; // Set height to match content
    });
  }, [taskDetails]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const generatedTitle = generateTitle();
    setLoading(true);

    try {
      let uploadedImagesUrls = [];

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
      const assignmentData = {
        ...taskDetails,
        scores,
        title: generatedTitle,
        level: selectedClass.split("-")[0],
        teacherId: session?.userId,
        teacherName: session?.name,
        schoolId: session.schoolId,
        images: uploadedImagesUrls,
      };

      let data;
      if (editMode) {
        const response = await axios.put(
          `/api/assignments/${editAssignmentId}`,
          assignmentData
        );
        data = response.data;
        setEditMode(false);
        setEditAssignmentId(null);
        setEditAssignment(null);
      } else {
        const response = await axios.post("/api/assignments", assignmentData);
        data = response.data;
      }

      alert(data.message);
      // Reset form fields
      setTaskDetails({
        instructions: "",
        givenDate: "",
        submissionDate: "",
        type: "ASSIGNMENT",
        questions: [""],
      });
      setScores([]);
      setFiles([]);
      setImageUrls([]);
      setSelectedClass("");
      setSelectedSubject("");
      await fetchAssignments();
    } catch (err) {
      console.error(err);
      alert("Error when submitting assignment.");
    } finally {
      setLoading(false);
    }
  };

  function getSubject() {
    if (!editMode) return;
    const regex = /\b[a-zA-Z]+[ ]?\d+\b/;
    const match = editAssignment?.title?.match(regex);
    if (match) {
      const remainingString = editAssignment?.title
        ?.replace(match[0], "")
        .trim();
      const words = remainingString.split(/\s+/);
      const subject = words.slice(0, -1).join(" ");
      return subject;
    }
    return null;
  }

  if (sessionStatus === "loading")
    return (
      <h1 className="waitH1">
        <Spinner /> Please wait...
      </h1>
    );
  if (sessionStatus !== "authenticated") redirect("/");
  return (
    <>
      <div ref={scrollRef} className={styles.teacherTask}>
        <h2>{editMode ? "Edit Assignment" : "Create New Assignment"}</h2>

        {assignments.length >= 30 ? (
          <h1>
            Do you still want to create new assignment? <br />
            You can not create more than 30 assignments at a time, you need to
            delete some existing one.
          </h1>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className={styles.generatedTitle}>
              <h4 className={styles.title}>Title: {generateTitle()}</h4>
            </div>

            <div className={styles.div1}>
              <p>
                <label htmlFor="classSelect">Select Class:</label>
                <select
                  id="classSelect"
                  value={selectedClass}
                  onChange={handleClassChange}
                  required
                >
                  {!selectedClass && (
                    <option value="" disabled>
                      Select class
                    </option>
                  )}
                  {selectedClass ? (
                    <option key={selectedClass} value={selectedClass}>
                      {selectedClass}
                    </option>
                  ) : (
                    session?.classes?.map((classItem) => (
                      <option key={classItem} value={classItem}>
                        {classItem}
                      </option>
                    ))
                  )}
                </select>
              </p>
              <p>
                <label htmlFor="subjectSelect">Select Subject:</label>
                <select
                  id="subjectSelect"
                  value={selectedSubject}
                  onChange={handleSubjectChange}
                  required
                >
                  {!getSubject() && (
                    <option value="" disabled>
                      Select subject
                    </option>
                  )}
                  {getSubject() ? (
                    <option key={getSubject()} value={getSubject()}>
                      {getSubject()}
                    </option>
                  ) : (
                    session.subjects?.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))
                  )}
                </select>
              </p>
              <p>
                <label htmlFor="type">Assignment Type:</label>
                <select
                  id="type"
                  name="type"
                  value={taskDetails.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Please Select</option>
                  <option value="ASSIGNMENT">Assignment</option>
                  <option value="MID_TERM_ASSIGNMENT">
                    Mid Term Assignment
                  </option>
                  <option value="HOLIDAY_ASSIGNMENT">Holiday Assignment</option>
                  <option value="PROJECT">Project</option>
                  <option value="HOLIDAY_PROJECT">Holiday Project</option>
                </select>
              </p>
              <p>
                <label htmlFor="givenDate">Given Date:</label>
                <input
                  id="givenDate"
                  type="date"
                  name="givenDate"
                  value={taskDetails.givenDate}
                  onChange={handleInputChange}
                  required
                />
              </p>

              {/* Submission Date */}
              <p>
                <label htmlFor="submissionDate">Submission Date:</label>
                <input
                  id="submissionDate"
                  type="date"
                  name="submissionDate"
                  value={taskDetails.submissionDate}
                  onChange={handleInputChange}
                  required
                />
              </p>
            </div>

            <div className={styles.div2}>
              <p>
                <label htmlFor="instructions">Instructions:</label>
                <textarea
                  id="instructions"
                  name="instructions"
                  placeholder="Give instructions"
                  value={taskDetails.instructions}
                  onChange={(e) => {
                    handleInputChange(e);
                  }}
                  required
                />
              </p>
              <div className={styles.questions}>
                <h4>Questions:</h4>

                {taskDetails.questions.map((question, index) => (
                  <div key={index}>
                    <p>
                      <label htmlFor={`question-${index}`}>
                        Question {index + 1}:
                      </label>
                      <textarea
                        id={`question-${index}`}
                        value={question}
                        onChange={(e) => {
                          handleQuestionChange(index, e.target.value);
                        }}
                        placeholder={`Question ${index + 1}`}
                        required
                      />
                    </p>
                    <p>
                      <label htmlFor={`score-${index}`}>
                        Mark for Question {index + 1}:
                      </label>
                      <input
                        type="number"
                        id={`score-${index}`}
                        value={scores[index] || ""}
                        placeholder="Mark"
                        onChange={(e) =>
                          handleScoreChange(index, e.target.value)
                        }
                        min="0"
                        max="100"
                        required
                      />
                    </p>
                  </div>
                ))}

                <button type="button" onClick={addQuestionField}>
                  Add Another Question
                </button>

                {taskDetails.questions.length > 1 && (
                  <button
                    className={styles.lastQuestion}
                    type="button"
                    onClick={removeQuestionField}
                  >
                    Remove Last Question
                  </button>
                )}
                <button type="button" onClick={() => setUpload(!upload)}>
                  <IoCloudUploadOutline />
                  {"  "}
                  {!upload ? "Upload image" : " Don't upload image"}
                </button>
              </div>
            </div>
            {upload ? (
              <FileUploaderArray
                imageUrls={imageUrls}
                onFieldChange={setImageUrls}
                setFiles={setFiles}
              />
            ) : (
              ""
            )}

            <div className={styles.btnContainer}>
              <button
                disabled={loading}
                className={loading ? styles.disabled : ""}
                type="submit"
              >
                {loading ? "Submitting..." : "Submit Assignment"}
              </button>
            </div>
          </form>
        )}
      </div>
      <TaskComponent
        teacherPage={true}
        assignments={assignments}
        school={school}
        handleDeleteAssignment={handleDeleteAssignment}
        handleEditAssignment={handleEditAssignment}
      />
    </>
  );
};

export default TeacherTask;

"use client";
import Link from "next/link";
import styles from "./TaskComponent.module.css";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { IoIosEyeOff, IoMdEye } from "react-icons/io";

const TaskComponent = ({
  assignments,
  school,
  handleDeleteAssignment,
  handleAnswerAssignment,
  handleEditAssignment,
  teacherPage,
  adminPage,
}) => {
  const pathname = usePathname();
  const pathSegments = pathname.split("/");
  const teacherId = pathSegments[3];
  const [review, setReview] = useState({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(20.0);
  const zoomIn = () => setZoomLevel((prev) => prev + 5.5);
  const zoomOut = () => setZoomLevel((prev) => Math.max(prev - 5.5, 6.0));
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggable, setIsDraggable] = useState(false); // New state
  const startPosition = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const openModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsModalOpen(true);
    setZoomLevel(20.5);
    setPosition({ x: 0, y: 0 });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    // Calculate scaled dimensions
    const scaledWidth = containerWidth * zoomLevel;
    const scaledHeight = containerHeight * zoomLevel;
    // Enable dragging if the image dimensions exceed the viewport
    setIsDraggable(
      scaledWidth > window.innerWidth || scaledHeight > window.innerHeight
    );
  }, [zoomLevel]);

  const handleMouseDown = (e) => {
    if (!isDraggable) return; // Only start dragging if draggable
    e.preventDefault();
    setIsDragging(true);
    startPosition.current = { x: e.clientX, y: e.clientY };
  };
  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const deltaX = (e.clientX - startPosition.current.x) / zoomLevel;
    const deltaY = (e.clientY - startPosition.current.y) / zoomLevel;

    const container = containerRef.current;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;

    const maxX = Math.max(
      (containerWidth * zoomLevel - window.innerWidth) / 2,
      0
    );
    const maxY = Math.max(
      (containerHeight * zoomLevel - window.innerHeight) / 2,
      0
    );

    setPosition((prevPosition) => ({
      x: Math.min(maxX, Math.max(prevPosition.x + deltaX, -maxX)),
      y: Math.min(maxY, Math.max(prevPosition.y + deltaY, -maxY)),
    }));
    startPosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };
  const handleTouchStart = (e) => {
    if (!isDraggable) return;
    e.preventDefault();
    setIsDragging(true);
    const touch = e.touches[0];
    startPosition.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;

    const touch = e.touches[0];
    const deltaX = (touch.clientX - startPosition.current.x) / zoomLevel;
    const deltaY = (touch.clientY - startPosition.current.y) / zoomLevel;

    const container = containerRef.current;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;

    const maxX = Math.max(
      (containerWidth * zoomLevel - window.innerWidth) / 2,
      0
    );
    const maxY = Math.max(
      (containerHeight * zoomLevel - window.innerHeight) / 2,
      0
    );

    setPosition((prevPosition) => ({
      x: Math.min(maxX, Math.max(prevPosition.x + deltaX, -maxX)),
      y: Math.min(maxY, Math.max(prevPosition.y + deltaY, -maxY)),
    }));

    startPosition.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  console.log(assignments);

  return (
    <div className={styles.tasks}>
      {assignments.map((assignment) => {
        const totalScore = assignment.studentScore
          ? assignment.studentScore.reduce((acc, curr) => acc + curr, 0)
          : 0;

        const hasNonZeroScore = assignment.studentScore
          ? assignment.studentScore.some((score) => score > 0)
          : false;

        return (
          <div key={assignment.id} className={styles.task}>
            <div className={styles.header}>
              {school?.logo ? (
                <Image
                  className={styles.logo}
                  src={school.logo}
                  alt={`${school.fullName} logo`}
                  height={100}
                  width={120}
                />
              ) : (
                <p>School logo not available</p>
              )}
              <h2>{school?.fullName?.toUpperCase()}</h2>
            </div>
            <h3 className={styles.title}>{assignment.title}</h3>
            <span className={styles.teacherName}>
              <strong>Teacher:</strong> {assignment.teacherName}
            </span>
            <div className={styles.date}>
              <strong>Given date:</strong>{" "}
              {new Date(assignment.givenDate).toDateString()}
            </div>
            <span className={styles.date}>
              <strong>Submission date:</strong>{" "}
              {new Date(assignment.submissionDate).toDateString()}
            </span>
            <span className={styles.instruction}>
              <strong>Instructions:</strong> {assignment.instructions}
            </span>
            <div className={styles.questions}>
              <h4>Questions:</h4>
              {assignment.questions.map((question, qIndex) => (
                <div key={qIndex} className={styles.questionItem}>
                  {`${qIndex + 1}. ${question}`}
                  {assignment.scores && assignment.scores[qIndex] && (
                    <div className={styles.score}>
                      <p>Mark: {assignment.scores[qIndex]} marks</p>
                      {assignment.studentScore &&
                        assignment.studentScore[qIndex] !== undefined &&
                        (assignment.studentScore[qIndex] > 0 ||
                          hasNonZeroScore) && (
                          <p>
                            Your Score: {assignment.studentScore[qIndex]} marks
                          </p>
                        )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {!teacherPage && !adminPage && (
              <>
                {" "}
                {assignment.studentSubmission.length > 0 && (
                  <div>
                    <button
                      className={styles.reviewBtn}
                      type="button"
                      onClick={() =>
                        setReview((prevState) => ({
                          ...prevState,
                          [assignment.id]: !prevState[assignment.id],
                        }))
                      }
                    >
                      {!review[assignment.id] ? (
                        <IoIosEyeOff className={styles.icon} />
                      ) : (
                        <IoMdEye className={styles.icon} />
                      )}
                      <span>
                        {!review[assignment.id] ? "Show review" : "Hide review"}
                      </span>
                    </button>
                    {review[assignment.id] && (
                      <div>
                        <h4>Submitted On: {assignment.submittedDate} </h4>
                        <ol>
                          {assignment.studentSubmission?.map(
                            (answer, index) => (
                              <li key={index}>
                                <strong>Answer to question {index + 1}:</strong>
                                <p
                                  dangerouslySetInnerHTML={{
                                    __html: answer.replace(/\n/g, "<br />"),
                                  }}
                                />
                              </li>
                            )
                          )}
                        </ol>
                        <div className={styles.imageGallery}>
                          {assignment.images &&
                            assignment.images.length > 0 && (
                              <p>Click on image to zoom in</p>
                            )}
                          <div className={styles.imageContainer}>
                            {assignment.images && assignment.images.length > 0
                              ? assignment.images.map((imageUrl, imgIndex) => (
                                  <div
                                    key={imgIndex}
                                    className={styles.imageWrapper}
                                  >
                                    <Image
                                      src={imageUrl}
                                      alt={`Assignment image ${imgIndex + 1}`}
                                      width={100}
                                      height={100}
                                      className={styles.assignmentImage}
                                      onClick={() => openModal(imageUrl)}
                                    />
                                  </div>
                                ))
                              : ""}

                            {isModalOpen && selectedImage && (
                              <div
                                className={styles.modalOverlay}
                                onClick={closeModal}
                              >
                                <div
                                  className={styles.modalContent}
                                  onClick={(e) => e.stopPropagation()}
                                  ref={containerRef}
                                >
                                  <div className={styles.scrollableContainer}>
                                    <Image
                                      src={selectedImage}
                                      alt="Selected Assignment Image"
                                      fill
                                      style={{
                                        objectFit: "contain",
                                        transform: `scale(${zoomLevel}) translate(${position.x}px, ${position.y}px)`,
                                        cursor: isDraggable
                                          ? "move"
                                          : "default",
                                      }}
                                      className={styles.zoomImage}
                                      draggable={false}
                                      onMouseDown={handleMouseDown}
                                      onMouseMove={handleMouseMove}
                                      onMouseUp={handleMouseUp}
                                      onMouseLeave={handleMouseUp}
                                      onTouchStart={handleTouchStart}
                                      onTouchMove={handleTouchMove}
                                      onTouchEnd={handleTouchEnd}
                                    />
                                  </div>
                                  <div className={styles.zoomControls}>
                                    <button onClick={zoomIn}>Zoom In</button>
                                    <button onClick={zoomOut}>Zoom Out</button>
                                    <button onClick={closeModal}>Close</button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {!teacherPage && !adminPage && (
              <div className={styles.actions}>
                {assignment.submissionStatus === "SUBMITTED" ? (
                  <p className={styles.submitted}>
                    {totalScore > 0
                      ? `Your total score is ${totalScore} marks`
                      : "Successfully Submitted"}
                  </p>
                ) : (
                  <button
                    onClick={() =>
                      handleAnswerAssignment(assignment.id, assignments)
                    }
                  >
                    Answer it
                  </button>
                )}
              </div>
            )}
            {adminPage && (
              <div className={styles.actions}>
                <button>
                  <Link
                    className={styles.link}
                    href={`/admin/task/${teacherId}/${assignment.id}`}
                  >
                    View Submission
                  </Link>
                </button>
              </div>
            )}
            {teacherPage && (
              <div className={styles.actions}>
                <button onClick={() => handleEditAssignment(assignment)}>
                  Edit Assignment
                </button>
                <button>
                  <Link className={styles.link} href={`/task/${assignment.id}`}>
                    View Submission
                  </Link>
                </button>
                <button onClick={() => handleDeleteAssignment(assignment.id)}>
                  Delete Assignment
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TaskComponent;

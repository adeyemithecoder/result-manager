"use client";
import { useState } from "react";
import styles from "./submit.module.css";
import { IoCloudUploadOutline } from "react-icons/io5";
import { FileUploaderArray } from "@/utils/FileUploader/FileUploader";

const AnswerAssignment = ({
  handleSubmit,
  submission,
  handleAnswerChange,
  scrollRef,
  input,
  isSubmitting,
  imageUrls,
  setImageUrls,
  setFiles,
}) => {
  const [upload, setUpload] = useState(false);

  const adjustHeight = (element) => {
    // Reset the height to a default value if the content is cleared
    element.style.height = "auto";
    if (element.value.trim() === "") {
      element.style.height = "50px"; // Set a default height, adjust as needed
    } else {
      element.style.height = element.scrollHeight + "px";
    }
  };

  const handleWordLimit = (index, value, element) => {
    const words = value.split(/\s+/);
    if (words.length > 300) {
      alert("Word length is too long. Only 300 words are allowed.");
      const trimmedWords = words.slice(0, 300).join(" ");
      if (words.length > 302) {
        handleAnswerChange(index, "");
        element.value = ""; // Clear the textarea value
      } else {
        handleAnswerChange(index, trimmedWords);
        element.value = trimmedWords; // Ensure the textarea displays the trimmed value
      }
      adjustHeight(element); // Adjust height after clearing or trimming
    } else {
      handleAnswerChange(index, value);
    }
  };

  return (
    <div className={styles.submit}>
      <h1>Submit Your Assignment</h1>
      <form onSubmit={handleSubmit}>
        {input.map((question, index) => (
          <div key={index}>
            <label>{question}</label>
            <textarea
              ref={scrollRef}
              value={submission[index] || ""}
              onChange={(e) => {
                handleWordLimit(index, e.target.value, e.target);
                adjustHeight(e.target);
              }}
              placeholder={`Enter your answer for question ${index + 1}`}
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => {
            setUpload(!upload);
            setFiles([]);
            setImageUrls([]);
          }}
        >
          <IoCloudUploadOutline />
          {"  "}
          {!upload ? "Upload image" : " Don't upload image"}
        </button>
        {upload ? (
          <FileUploaderArray
            imageUrls={imageUrls}
            onFieldChange={setImageUrls}
            setFiles={setFiles}
          />
        ) : (
          ""
        )}
        <button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default AnswerAssignment;

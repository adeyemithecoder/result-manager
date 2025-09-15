"use client";
import React, { useEffect, useState } from "react";
import styles from "../secondary.module.css";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FileUploader } from "@/utils/FileUploader/FileUploader";
import { useUploadThing } from "@/utils/uploadthing";
import imageCompression from "browser-image-compression";
import { useSession } from "next-auth/react";
import Spinner from "@/components/Spinner/Spinner";

const EditStudente = ({ params }) => {
  const { studentId } = params;
  const [student, setStudent] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [levels, setLevels] = useState([]);
  const [variants, setVariants] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { startUpload } = useUploadThing("imageUploader");
  const { data: session, status: sessionStatus } = useSession();
  useEffect(() => {
    const fetchUserData = async () => {
      const { data } = await axios.get(`/api/student/${studentId}`);
      setStudent(data);
      setImageUrl(data.image);
    };
    fetchUserData();
  }, [studentId]);

  useEffect(() => {
    const fetchSchoolData = async () => {
      try {
        const { data } = await axios.get(`/api/school/${session.schoolId}`);
        const extractedLevels = [
          ...new Set(data.classes.map((cls) => cls.split("-")[0])),
        ];
        // Extract unique variants, filtering out empty strings
        const extractedVariants = [
          ...new Set(
            data.classes
              .map((cls) => cls.split("-")[1] || "")
              .filter((variant) => variant)
          ),
        ];

        setLevels(extractedLevels);
        setVariants(extractedVariants);
      } catch (error) {
        console.error("Error fetching school data:", error);
      }
    };

    if (session?.schoolId) {
      fetchSchoolData();
    }
  }, [session]);

  const handleUpdateUser = async () => {
    setLoading(true);
    try {
      let uploadedImageUrl = imageUrl;

      if (files.length > 0) {
        const compressedFiles = await Promise.all(
          files.map(async (file) => {
            let compressedFile = await imageCompression(file, {
              maxSizeMB: 1,
              maxWidthOrHeight: 1024,
              useWebWorker: true,
            });
            // Check if the compressed file size exceeds 1 MB and compress again if necessary
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
        const uploadedImages = await startUpload(compressedFiles);
        if (!uploadedImages) {
          alert("Image upload failed. Please try again.");
          setLoading(false);
          return;
        }
        uploadedImageUrl = uploadedImages[0].url;
      }

      const updatedData = { ...student, image: uploadedImageUrl };
      const { data } = await axios.patch(`/api/student/${studentId}`, {
        newData: updatedData,
      });
      alert(data.message);
      router.push("/admin/secondary");
    } catch (err) {
      console.log(err);
      alert("Error When Updating");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Prevent spaces for username and password fields
    if (name === "username" || name === "password") {
      const noSpaceValue = value.replace(/\s/g, "");
      setStudent({ ...student, [name]: noSpaceValue });
    } else {
      setStudent({ ...student, [name]: value });
    }
  };

  if (!student) {
    return (
      <h1 className="waitH1">
        <Spinner /> Loading...
      </h1>
    );
  }

  return (
    <div className={styles.singleUser}>
      <h1>Edit Student</h1>

      <div className={styles.wrapper}>
        <div className={styles.allInputContainer}>
          {/* Existing input fields */}
          <div>
            <label>Username:</label>
            <input
              type="text"
              value={student.username}
              name="username"
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="text"
              value={student.password}
              name="password"
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Name:</label>
            <input
              type="text"
              value={student.name}
              onChange={(e) => setStudent({ ...student, name: e.target.value })}
            />
          </div>
          <div>
            <label>Surname:</label>
            <input
              type="text"
              value={student.surname}
              onChange={(e) =>
                setStudent({ ...student, surname: e.target.value })
              }
            />
          </div>
          <div>
            <label>Age:</label>
            <input
              type="text"
              value={student.age}
              onChange={(e) => setStudent({ ...student, age: e.target.value })}
            />
          </div>
          {/* New input field for registrationNo */}
          <div>
            <label>Registration No:</label>
            <input
              type="text"
              name="registrationNo"
              value={student.registrationNo || ""}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className={styles.allSelectContainer}>
          {/* Existing select fields */}
          <div className={styles.selectContainer}>
            <label htmlFor="level">Level</label>
            <select
              value={student.level}
              onChange={handleInputChange}
              name="level"
              id="level"
              required
            >
              <option value="" disabled hidden>
                Select Level
              </option>
              {levels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.selectContainer}>
            <label htmlFor="variant">Variant</label>
            <select
              value={
                student.variant || (variants.length === 0 ? "no-variant" : "")
              }
              onChange={handleInputChange}
              name="variant"
              id="variant"
            >
              <option value="" disabled hidden>
                Select Variant
              </option>
              {variants.length === 0 ? (
                <option value="no-variant">No Variant Available</option>
              ) : (
                variants.map((variant) => (
                  <option key={variant} value={variant}>
                    {variant}
                  </option>
                ))
              )}
            </select>
          </div>
          <div className={styles.selectContainer}>
            <label htmlFor="gender">Gender</label>
            <select
              value={student.gender.toLowerCase()}
              onChange={handleInputChange}
              name="gender"
              id="gender"
              required
            >
              <option value="" disabled hidden>
                Select Gender
              </option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>{" "}
          <FileUploader
            onFieldChange={(url) => setImageUrl(url)}
            imageUrl={imageUrl}
            setFiles={setFiles}
          />
        </div>
      </div>
      <button
        className={loading && styles.disabled}
        onClick={handleUpdateUser}
        disabled={loading}
      >
        {loading ? "Loading..." : "Update"}
      </button>
    </div>
  );
};

export default EditStudente;

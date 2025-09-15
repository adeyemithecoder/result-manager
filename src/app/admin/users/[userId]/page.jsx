"use client";
import React, { useEffect, useState } from "react";
import styles from "../AllUser.module.css";
import { useRouter } from "next/navigation";
import { FileUploader } from "@/utils/FileUploader/FileUploader";
import { useUploadThing } from "@/utils/uploadthing";
import axios from "axios";
import Spinner from "@/components/Spinner/Spinner";

const EditUser = ({ params }) => {
  const { userId } = params;
  const [user, setUser] = useState(null);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [files, setFiles] = useState([]);
  const router = useRouter();
  const { startUpload } = useUploadThing("imageUploader");

  useEffect(() => {
    const fetchUserData = async () => {
      const { data } = await axios.get(`/api/users/${userId}`);
      setUser(data);
      setSelectedClasses(data.classes);
      setSelectedSubjects(data.subjects);
      setImageUrl(data.imageUrl); // Set the initial image URL
    };
    fetchUserData();
  }, [userId]);

  const handleUpdateUser = async () => {
    setLoading(true);
    try {
      let uploadedImageUrl = imageUrl;

      if (files.length > 0) {
        const uploadedImages = await startUpload(files);
        if (!uploadedImages) {
          alert("Image size is too big please click on image to change it.");
          setLoading(false);
          return;
        }
        uploadedImageUrl = uploadedImages[0].url;
      }
      const updatedData = {
        username: user.username,
        password: user.password,
        role: user.role,
        name: user.name,
        gender: user.gender,
        classes: selectedClasses,
        subjects: selectedSubjects,
        imageUrl: uploadedImageUrl,
      };
      const { data } = await axios.patch(`/api/users/${userId}`, {
        otherFields: updatedData,
        newClasses: selectedClasses,
        newSubjects: selectedSubjects,
      });
      if (files.length > 0) {
        await axios.post("/api/img", {
          username: user.username,
          imageUrl: uploadedImageUrl,
        });
      }
      alert(data.message);
      router.push("/admin/users");
    } catch (err) {
      console.log(err);
      alert("Error When Updating");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <h1 className="waitH1">
        <Spinner /> Please wait...
      </h1>
    );
  }

  return (
    <div className={styles.singleUser}>
      <div className={styles.div1}>
        <h2>Edit page</h2>
        <div className={styles.container}>
          <div className={styles.allInput}>
            <label>Username:</label>
            <input
              type="text"
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
            />
            <label>Password:</label>
            <input
              type="text"
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
            />{" "}
            <label>Role:</label>
            <select
              value={user.role}
              onChange={(e) => setUser({ ...user, role: e.target.value })}
            >
              <option value="USER">USER</option>
              <option value="ACCOUNTANT">ACCOUNTANT</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <label>Name:</label> {/* Name field */}
            <input
              type="text"
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
            />
            <label>Gender:</label> {/* Gender field */}
            <select
              value={user.gender || ""}
              onChange={(e) => setUser({ ...user, gender: e.target.value })}
            >
              <option value="" disabled>
                Select Gender
              </option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <FileUploader
          onFieldChange={(url) => setImageUrl(url)}
          imageUrl={imageUrl}
          setFiles={setFiles}
        />
        <button
          className={loading && styles.disabled}
          onClick={handleUpdateUser}
          disabled={loading}
        >
          {loading ? "Loading..." : "Update"}
        </button>
      </div>
    </div>
  );
};

export default EditUser;

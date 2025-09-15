"use client";
import React, { useEffect, useState } from "react";
import styles from "./new-class.module.css";
import { signOut, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import axios from "axios";
import Spinner from "@/components/Spinner/Spinner";

const NewClass = () => {
  const [newClass, setNewClass] = useState("");
  const [schoolId, setSchoolId] = useState(null);
  const [schoolClasses, setSchoolClasses] = useState([]);
  const [editingClass, setEditingClass] = useState(null);
  const [editedClassName, setEditedClassName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: session, status: sessionStatus } = useSession();

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      if (session.role !== "SUPER_ADMIN") {
        signOut();
        redirect("/");
      }
    }
  }, [sessionStatus, session]);

  useEffect(() => {
    const fetchSchoolClasses = async () => {
      try {
        const { data } = await axios.get(`/api/school/${schoolId}`);
        const sortedClasses = data.classes ? data.classes.sort() : [];
        setSchoolClasses(sortedClasses || []);
        setSchoolName(data.name);
      } catch (error) {
        console.error("Error fetching school classes:", error);
      }
    };
    if (schoolId) {
      fetchSchoolClasses();
    }
  }, [schoolId]);

  const createClass = async () => {
    if (!newClass.trim() || !schoolId) {
      alert("Please enter both a class name and a school ID.");
      return;
    }
    setLoading(true);
    try {
      const updatedClasses = [...schoolClasses, newClass.trim()];
      const { data } = await axios.patch(`/api/school/${schoolId}`, {
        classes: updatedClasses,
      });
      alert(data.message);
      setSchoolClasses(updatedClasses);
      setNewClass(""); // Clear the input field
    } catch (err) {
      console.error("Error creating class:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClass = (className) => {
    setEditingClass(className);
    setEditedClassName(className);
  };

  const saveEditedClass = async () => {
    if (!editedClassName.trim()) {
      alert("Please enter a class name.");
      return;
    }
    setLoading(true);
    try {
      const updatedClasses = schoolClasses.map((className) =>
        className === editingClass ? editedClassName.trim() : className
      );
      const { data } = await axios.patch(`/api/school/${schoolId}`, {
        classes: updatedClasses,
      });
      alert(data.message);
      setSchoolClasses(updatedClasses);
      setEditingClass(null);
      setEditedClassName(""); // Clear the input field
    } catch (err) {
      console.error("Error saving edited class:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteClass = async (className) => {
    if (!confirm(`Are you sure you want to delete ${className}?`)) {
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.delete(
        `/api/school/class/${schoolId}-${className}`,
        {
          data: { schoolId, className },
        }
      );
      alert(data.message);
      setSchoolClasses(
        schoolClasses.filter((classItem) => classItem !== className)
      );
    } catch (err) {
      console.error("Error deleting class:", err);
    } finally {
      setLoading(false);
    }
  };

  if (sessionStatus === "loading")
    return (
      <h1 className="waitH1">
        <Spinner /> Please wait...
      </h1>
    );
  if (sessionStatus !== "authenticated") redirect("/");

  return (
    <div className={styles.newClass}>
      <h1>Add Class to a School</h1>
      <h4>Please use hyphen for class with variant: js1-gold</h4>
      <div className={styles.selectContainer}>
        <input
          value={newClass}
          onChange={(e) => setNewClass(e.target.value)}
          type="text"
          placeholder="Enter new class"
        />
        <input
          value={schoolId}
          onChange={(e) => setSchoolId(e.target.value.trim())}
          type="number"
          placeholder="Enter school id"
        />
        <div className={styles.buttonContainer}>
          <button
            disabled={loading}
            className={loading ? styles.disabled : ""}
            onClick={createClass}
          >
            {loading ? "Creating..." : "Create Class"}
          </button>
        </div>
      </div>

      <div className={styles.subjects}>
        <h2>All Classes of {schoolName} school</h2>

        <ul>
          {schoolClasses.map((className) => (
            <li key={className}>
              {editingClass === className ? (
                <input
                  autoFocus
                  value={editedClassName}
                  onChange={(e) => setEditedClassName(e.target.value)}
                />
              ) : (
                className
              )}
              <span>
                {editingClass === className ? (
                  <div style={{ display: "flex" }}>
                    <button
                      disabled={loading}
                      className={styles.save}
                      onClick={saveEditedClass}
                    >
                      {loading ? "wait..." : "Save"}
                    </button>
                    <button
                      disabled={loading}
                      className={styles.save}
                      onClick={() => setEditingClass(null)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex" }}>
                    <button
                      className={styles.edit}
                      onClick={() => handleEditClass(className)}
                    >
                      Edit
                    </button>
                    <button
                      className={styles.delete}
                      onClick={() => deleteClass(className)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NewClass;

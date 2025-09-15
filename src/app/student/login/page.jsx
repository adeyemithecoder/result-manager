"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./StudentLogin.module.css";
import { FormInput } from "@/components/form/FormInput";
import axios from "axios";
import { IoIosEyeOff, IoMdEye } from "react-icons/io";

const StudentLogin = () => {
  const initialValues = {
    password: "",
    username: "",
  };

  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Check if student is already logged in
  useEffect(() => {
    const studentData = localStorage.getItem("studentData");
    if (studentData) {
      router.push("/student/dashboard");
    }
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setValues({
      ...values,
      [name]: value.trim(),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.get(
        `/api/student/login/${values.username}-${values.password}`
      );
      if (data.status === 404) {
        setError(data.message);
        setLoading(false);
        return;
      }
      // Save student data to localStorage and navigate to option page
      localStorage.setItem("studentData", JSON.stringify(data));
      router.push("/student/dashboard");
    } catch (err) {
      console.error(err);
      setError("An error occurred during login.");
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit}>
        <div>
          <h2 className={styles.h2}>Enter Student Login Details</h2>
          <FormInput
            errMes="Username should be 3-16 characters and must not include any special character or space!"
            label=""
            type="text"
            placeholder="Username"
            name="username"
            required={true}
            pattern="^[A-Za-z0-9]{3,16}$"
            value={values.username}
            onChange={handleInputChange}
          />
          <FormInput
            label=""
            type="password"
            placeholder="Password"
            name="password"
            required={true}
            value={values.password}
            onChange={handleInputChange}
            eyeOpen={<IoMdEye />}
            eyeClose={<IoIosEyeOff />}
          />
          <div className={styles.btnContainer}>
            <button
              className={loading ? styles.disabled : ""}
              disabled={loading}
            >
              {loading ? "Loading..." : "Login"}
            </button>
          </div>

          {error && <p className={styles.error}>{error}</p>}
        </div>
      </form>
    </div>
  );
};

export default StudentLogin;

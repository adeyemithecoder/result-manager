"use client";
import { useEffect, useState } from "react";
import styles from "./register.module.css";
import { FormInput } from "@/components/form/FormInput";
import { redirect } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import axios from "axios";
import Spinner from "@/components/Spinner/Spinner";

const Register = () => {
  const [loading, setLoading] = useState(false);

  const initialValues = {
    username: "",
    password: "",
    confirmPassword: "",
    role: "ADMIN",
    schoolId: "",
  };

  const [values, setValues] = useState(initialValues);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setValues({
      ...values,
      [name]: value.trim(),
    });
  };

  const { data: session, status: sessionStatus } = useSession();
  useEffect(() => {
    if (sessionStatus === "authenticated") {
      if (session.role !== "SUPER_ADMIN") {
        signOut();
        redirect("/");
      }
    }
  }, [sessionStatus, session]);
  if (sessionStatus == "loading")
    return (
      <h1 className="waitH1">
        <Spinner /> Please wait...
      </h1>
    );
  if (sessionStatus !== "authenticated") redirect("/");

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      const { data } = await axios.post("/api/users/create", {
        username: values.username,
        password: values.password,
        role: values.role,
        schoolId: values.role === "SUPER_ADMIN" ? null : values.schoolId,
      });
      console.log(data);
      alert(data.message);
      setValues(initialValues);
      setLoading(false);
    } catch (error) {
      console.error("Error occurred:", error);
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit}>
        <div>
          <h2 className={styles.h2}>Register User</h2>
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
            errMes="Password should be 8-20 characters and include at least 1 number, 1 letter."
            type="password"
            placeholder="Password"
            name="password"
            required={true}
            pattern="^(?=.*[0-9])(?=.*[a-zA-Z]).{8,20}$"
            value={values.password}
            onChange={handleInputChange}
          />
          <FormInput
            errMes="Please let Passwords match"
            label=""
            type="password"
            placeholder="Confirm Password"
            name="confirmPassword"
            required={true}
            pattern={values.password}
            value={values.confirmPassword}
            onChange={handleInputChange}
          />
          <div className={styles.selectContainer}>
            <select
              name="role"
              value={values.role}
              onChange={handleInputChange}
              required
            >
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>
          {values.role !== "SUPER_ADMIN" && (
            <FormInput
              errMes="Please enter a valid school ID"
              label=""
              type="number"
              placeholder="School ID"
              name="schoolId"
              required={values.role !== "SUPER_ADMIN"}
              value={values.schoolId}
              onChange={handleInputChange}
            />
          )}
          <div className={styles.btnContainer}>
            <button
              disabled={loading}
              className={loading ? styles.disabled : ""}
            >
              {loading ? "Adding..." : "Register"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Register;

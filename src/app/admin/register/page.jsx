"use client";
import { useEffect, useState } from "react";
import styles from "./register.module.css";
import { FormInput } from "@/components/form/FormInput";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";

const Register = () => {
  const [loading, setLoading] = useState(false);
  const { data: session, status: sessionStatus } = useSession();

  const initialValues = {
    username: "",
    name: "",
    gender: "",
    password: "",
    confirmPassword: "",
    schoolId: session?.schoolId,
  };

  const [values, setValues] = useState(initialValues);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Prevent spaces in username and password fields
    if (
      name === "username" ||
      name === "password" ||
      name === "confirmPassword"
    ) {
      const noSpacesValue = value.replace(/\s/g, ""); // Remove any spaces
      setValues({
        ...values,
        [name]: noSpacesValue,
      });
    } else {
      setValues({
        ...values,
        [name]: value,
      });
    }
  };

  useEffect(() => {
    if (sessionStatus !== "authenticated") {
      redirect("/");
    }
  }, [sessionStatus]);

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    const trimmedValues = {
      name: values.name.trim(),
      gender: values.gender.trim(),
      username: values.username.trim(),
      password: values.password.trim(),
      confirmPassword: values.confirmPassword.trim(),
      schoolId: values.schoolId,
    };

    // Ensure password and confirm password match
    if (trimmedValues.password !== trimmedValues.confirmPassword) {
      alert("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.post("/api/users/create", {
        name: trimmedValues.name,
        gender: trimmedValues.gender,
        username: trimmedValues.username,
        password: trimmedValues.password,
        schoolId: trimmedValues.schoolId,
      });
      alert(data.message);
      setValues(initialValues);
      setLoading(false);
    } catch (error) {
      console.error("Error occurred:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit}>
        <div>
          <h2 className={styles.h2}>Register User </h2>
          <FormInput
            label=""
            type="text"
            placeholder="Name"
            name="name"
            required={true}
            value={values.name}
            onChange={handleInputChange}
          />
          <FormInput
            label=""
            errMes="Username should be 3-16 characters and must not include any spaces or special characters!"
            pattern="^[A-Za-z0-9]{3,16}$"
            type="text"
            placeholder="Username"
            name="username"
            required={true}
            value={values.username}
            onChange={handleInputChange}
          />
          <div className={styles.selectContainer}>
            <select
              value={values.gender}
              onChange={handleInputChange}
              name="gender"
              id="gender"
              required
              placeholder="Gender"
            >
              <option value="" disabled>
                Gender
              </option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <FormInput
            label=""
            errMes="Password should be 8-20 characters and must not include spaces, and include at least 1 number, 1 letter."
            type="password"
            pattern="^(?=.*[0-9])(?=.*[a-zA-Z])(?!.*\s).{8,20}$"
            placeholder="Password"
            name="password"
            required={true}
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

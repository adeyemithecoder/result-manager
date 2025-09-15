"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./login.module.css";
import { signIn, useSession } from "next-auth/react";
import { FormInput } from "@/components/form/FormInput";
import { IoIosEyeOff, IoMdEye } from "react-icons/io";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const initialValues = {
    password: "",
    username: "",
  };
  const [values, setValues] = useState(initialValues);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setValues({
      ...values,
      [name]: value.trim(),
    });
  };

  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      const role = session.role;
      if (role === "ADMIN") {
        router.push("/admin");
      } else if (role === "SUPER_ADMIN") {
        router.push("/super-admin");
      } else if (role === "ACCOUNTANT") {
        router.push("/payment");
      } else {
        router.push("/attendance");
      }
    }
  }, [router, sessionStatus, session]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: values.username,
        password: values.password,
      });

      if (res?.error) {
        setError("Wrong credentials");
      }
    } catch (err) {
      console.log(err);
      setError("An error occurred during login");
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit}>
        <div>
          <h2 className={styles.h2}>Users Login</h2>
          <FormInput
            errMes="Username should be 3-16 characters and must not include any special character  or space!"
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
              disabled={loading}
              className={loading ? styles.disabled : ""}
            >
              {loading ? "Loading..." : "Login"}{" "}
            </button>
          </div>

          {error && <p className={styles.error}>{error}</p>}
        </div>
      </form>
    </div>
  );
};

export default Login;

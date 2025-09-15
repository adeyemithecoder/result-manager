"use client";
import { useEffect, useState } from "react";
import styles from "../AdminList.module.css";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FormInput } from "@/components/form/FormInput";

const EditAdmin = ({ params }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "ADMIN",
    schoolId: "",
  });

  const { adminId } = params;
  const router = useRouter();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const { data } = await axios.get(`/api/school/admin/${adminId}`);
        console.log(data);
        setFormData({
          username: data.username,
          password: data.password,
          role: data.role,
          schoolId: data.schoolId,
        });
      } catch (error) {
        console.error("Error fetching admin data:", error);
      }
    };
    if (adminId) {
      fetchAdminData();
    }
  }, [adminId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.patch(
        `/api/school/admin/${adminId}`,
        formData
      );
      console.log(data);
      alert(data.message);
      router.push("/super-admin/all-admin");
    } catch (err) {
      console.error("Error updating admin:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <FormInput
            label="Username"
            type="text"
            name="username"
            required={true}
            value={formData.username}
            onChange={handleChange}
          />
          <FormInput
            label="Password"
            type="text"
            name="password"
            required={true}
            value={formData.password}
            onChange={handleChange}
          />
          <FormInput
            label="School ID"
            type="text"
            name="schoolId"
            required={true}
            value={formData.schoolId}
            onChange={handleChange}
          />
        </div>
        <div className={styles.selectContainer}>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="ADMIN">Admin</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>
        </div>

        <div className={styles.btnContainer}>
          <button disabled={loading} className={loading ? styles.disabled : ""}>
            {loading ? "Updating..." : "Update Admin"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditAdmin;

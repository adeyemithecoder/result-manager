"use client";
import { useEffect, useState } from "react";
import styles from "../AllUser.module.css";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FileUploader } from "@/utils/FileUploader/FileUploader";
import { useUploadThing } from "@/utils/uploadthing";

const SuperAdmin = ({ params }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    fullName: "",
    address: "",
    contactEmail: "",
    phoneNumber: "",
    motto: "",
    logo: "",
  });
  const [logo, setLogo] = useState("");
  const [files, setFiles] = useState([]);

  const { startUpload } = useUploadThing("imageUploader");
  const { schoolId } = params;
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  useEffect(() => {
    const fetchSchoolData = async () => {
      try {
        const { data } = await axios.get(`/api/school/${schoolId}`);
        setFormData({
          name: data.name,
          fullName: data.fullName,
          address: data.address,
          contactEmail: data.contactEmail,
          phoneNumber: data.phoneNumber,
          motto: data.motto,
          logo: data.logo,
        });
        setLogo(data.logo);
      } catch (error) {
        console.error("Error fetching school data:", error);
      }
    };
    if (schoolId) {
      fetchSchoolData();
    }
  }, [schoolId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let updatedFormData = { ...formData };

      if (files.length > 0) {
        const uploadedImages = await startUpload(files);
        if (!uploadedImages) {
          setLoading(false);
          return;
        }
        updatedFormData.logo = uploadedImages[0].url;
      }

      const { data } = await axios.patch(`/api/school/${schoolId}`, {
        ...updatedFormData,
      });
      alert(data.message);
      router.push("/super-admin/schools");
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Edit School</h2>
      <FileUploader
        onFieldChange={(url) => setLogo(url)}
        imageUrl={logo}
        setFiles={setFiles}
      />
      <form onSubmit={handleSubmit} className={styles.schoolForm}>
        <div className={styles.formGroup}>
          <label htmlFor="name">School Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="fullName">Full Name</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="address">Address</label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          ></textarea>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="contactEmail">Contact Email</label>
          <input
            type="email"
            id="contactEmail"
            name="contactEmail"
            value={formData.contactEmail}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="motto">Motto</label>
          <input
            type="text"
            id="motto"
            required
            name="motto"
            value={formData.motto}
            onChange={handleChange}
          />
        </div>
        <button disabled={loading} type="submit">
          {loading ? "Updating..." : "Update School"}
        </button>
      </form>
    </div>
  );
};

export default SuperAdmin;

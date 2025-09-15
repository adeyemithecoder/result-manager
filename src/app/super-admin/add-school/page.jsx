"use client";
import { useEffect, useState } from "react";
import styles from "./super-admin.module.css";
import axios from "axios";
import { FileUploader } from "@/utils/FileUploader/FileUploader";
import { useUploadThing } from "@/utils/uploadthing";
import { useSession } from "next-auth/react";
import Spinner from "@/components/Spinner/Spinner";

const SuperAdmin = () => {
  const [formData, setFormData] = useState({
    name: "",
    fullName: "",
    address: "",
    contactEmail: "",
    phoneNumber: "",
    motto: "",
    headmaster: "",
    principal: "",
    logo: "",
  });

  const [loading, setLoading] = useState(false);
  const [logo, setLogo] = useState("");
  const [files, setFiles] = useState([]);

  const { startUpload } = useUploadThing("imageUploader");

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
      const res = await axios.post("/api/school", {
        name: formData.name,
        fullName: formData.fullName,
        address: formData.address,
        contactEmail: formData.contactEmail,
        phoneNumber: formData.phoneNumber,
        principal: formData.principal,
        headmaster: formData.headmaster,
        motto: formData.motto,
      });
      console.log(res.data);
      if (res.data.status !== 201) {
        alert(res.data.message);
        setLoading(false);
        return;
      }
      let uploadedImageUrl = formData.logo;
      if (files.length > 0) {
        const uploadedImages = await startUpload(files);
        if (!uploadedImages) {
          setLoading(false);
          return;
        }
        uploadedImageUrl = uploadedImages[0].url;
      }
      const { data } = await axios.patch(`/api/school/${res.data.data.id}`, {
        ...formData,
        logo: uploadedImageUrl,
      });
      console.log(data);
      alert(data.message);
      setFormData({
        name: "",
        fullName: "",
        address: "",
        contactEmail: "",
        phoneNumber: "",
        headmaster: "",
        principal: "",
        motto: "",
        logo: "",
      });
      setLogo("");
      setFiles([]);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
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
  return (
    <div className={styles.container}>
      <h2>Create New School</h2>
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
        <div className={styles.formGroup}>
          <label htmlFor="principal">Principal Name</label>
          <input
            type="text"
            id="principal"
            required
            name="principal"
            value={formData.principal}
            onChange={handleChange}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="headmaster">Headmaster Name</label>
          <input
            type="text"
            id="headmaster"
            required
            name="headmaster"
            value={formData.headmaster}
            onChange={handleChange}
          />
        </div>
        <button disabled={loading} type="submit">
          {loading ? "Creating..." : "Create School"}
        </button>
      </form>
    </div>
  );
};

export default SuperAdmin;

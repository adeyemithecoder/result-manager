"use client";
import { useCallback, useEffect } from "react";
import { useDropzone } from "@uploadthing/react/hooks";
import { generateClientDropzoneAccept } from "uploadthing/client";
import styles from "./FileUploader.module.css";
import Image from "next/image";
import { IoMdAddCircle } from "react-icons/io";

export function FileUploader({ imageUrl, onFieldChange, setFiles }) {
  const onDrop = useCallback(
    (acceptedFiles) => {
      setFiles(acceptedFiles);
      onFieldChange(convertFileToUrl(acceptedFiles[0]));
    },
    [setFiles, onFieldChange]
  );
  const convertFileToUrl = (file) => URL.createObjectURL(file);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: "image/*" ? generateClientDropzoneAccept(["image/*"]) : undefined,
  });

  return (
    <div {...getRootProps()} className={styles.FileUploader}>
      <input {...getInputProps()} className="cursor-pointer" />

      {imageUrl ? (
        <div className={styles.imgContainer}>
          <Image src={imageUrl} alt="image" fill className={styles.img} />
        </div>
      ) : (
        <div className={styles.text}>
          <Image
            src="/assets/icons/upload.svg"
            width={120}
            height={120}
            alt="file upload"
          />
          <h5 className="mb-2 mt-2">Would you like to use image?</h5>
        </div>
      )}
    </div>
  );
}

export function FileUploaderArray({ imageUrls, onFieldChange, setFiles }) {
  const onDrop = useCallback(
    (acceptedFiles) => {
      // Append new files to the existing ones
      setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);

      // Generate URLs for new files and add to imageUrls
      const newUrls = acceptedFiles.map((file) => URL.createObjectURL(file));
      onFieldChange((prevUrls) => [...prevUrls, ...newUrls]);
    },
    [setFiles, onFieldChange]
  );

  // Clean up URLs when component unmounts
  useEffect(() => {
    return () => {
      imageUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imageUrls]);

  const handleRemoveLastImage = () => {
    if (imageUrls.length > 0) {
      const updatedUrls = imageUrls.slice(0, -1); // Remove the last image URL
      onFieldChange(updatedUrls);
      setFiles((prevFiles) => prevFiles.slice(0, -1)); // Remove the last file from files
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: generateClientDropzoneAccept(["image/*"]),
    multiple: true,
  });

  return (
    <div className={styles.main}>
      <div {...getRootProps()} className={styles.FileUploaderArray}>
        <input {...getInputProps()} className="cursor-pointer" multiple />

        {imageUrls && imageUrls.length > 0 ? (
          <div className={styles.imgArrayContainer}>
            {imageUrls.map((url, index) => (
              <div key={index} className={styles.imgWrapper}>
                <Image
                  src={url}
                  alt={`Selected image ${index + 1}`}
                  width={100}
                  height={100}
                  className={styles.imgArray}
                />
              </div>
            ))}
            <p className={styles.addMore}>
              {" "}
              <IoMdAddCircle className={styles.icon} />
            </p>
          </div>
        ) : (
          <div className={styles.text}>
            <Image
              src="/assets/icons/upload.svg"
              width={77}
              height={77}
              alt="file upload"
            />
            <h5 className="mb-2 mt-2">Would you like to upload image?</h5>
          </div>
        )}
      </div>

      <div className={styles.removeButton}>
        {imageUrls.length > 0 && (
          <h4 onClick={handleRemoveLastImage}>Remove last image</h4>
        )}
      </div>
    </div>
  );
}

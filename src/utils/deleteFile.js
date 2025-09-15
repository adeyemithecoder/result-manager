import { UTApi } from "uploadthing/server";

// Create an instance of UTApi
export const utapi = new UTApi();

export const deleteImage = async (imageUrl) => {
  if (!imageUrl) return;
  try {
    const fileKey = imageUrl.split("/").pop();
    const res = await utapi.deleteFiles([fileKey]); // Call the deleteFiles method with the file key
  } catch (error) {
    console.error("Error deleting image:", error);
  }
};

export const deleteImages = async (imageUrls) => {
  if (!imageUrls || imageUrls.length === 0) return;
  try {
    // Extract file keys from each URL
    const fileKeys = imageUrls.map((url) => url.split("/").pop());
    const res = await utapi.deleteFiles(fileKeys);
  } catch (error) {
    console.error("Error deleting images:", error);
  }
};

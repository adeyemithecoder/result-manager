import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";

export const UploadButton = generateUploadButton();
export const UploadDropzone = generateUploadDropzone();

import { generateReactHelpers } from "@uploadthing/react/hooks";

export const { useUploadThing, uploadFiles } = generateReactHelpers();

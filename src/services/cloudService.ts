import axiosInstance from "../const/axios/axiosInstance";

export interface UploadImageResponseDto {
  message: string;
  imageUrl: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  createdAt: string;
}

export interface UploadVideoResponseDto {
  message: string;
  videoUrl: string;
  publicId: string;
  format: string;
  duration: number;
  width: number;
  height: number;
  bytes: number;
  createdAt: string;
}

export interface UploadDocumentResponseDto {
  message: string;
  fileUrl: string;
  publicId: string;
  format: string;
  bytes: number;
  createdAt: string;
}

export interface DeleteAssetResponseDto {
  message: string;
  publicId: string;
  result: string;
}

// =====================
// HÀM UPLOAD
// =====================

export const uploadImage = async (image: {
  uri: string;
  name: string;
  type: string;
}): Promise<UploadImageResponseDto> => {
  const formData = new FormData();
  formData.append("imageFile", {
    uri: image.uri,
    name: image.name,
    type: image.type,
  } as any);

  try {
    const response = await axiosInstance.post<UploadImageResponseDto>(
      "/cloudinary-test/upload-image",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("UploadImage API error:", error);
    throw error;
  }
};

export const uploadVideo = async (video: {
  uri: string;
  name: string;
  type: string;
}): Promise<UploadVideoResponseDto> => {
  const formData = new FormData();
  formData.append("videoFile", {
    uri: video.uri,
    name: video.name,
    type: video.type,
  } as any);

  try {
    const response = await axiosInstance.post<UploadVideoResponseDto>(
      "/cloudinary-test/upload-video",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("UploadVideo API error:", error);
    throw error;
  }
};

export const uploadDocument = async (file: {
  uri: string;
  name: string;
  type: string;
}): Promise<UploadDocumentResponseDto> => {
  const formData = new FormData();
  formData.append("rawFile", {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as any);

  try {
    const response = await axiosInstance.post<UploadDocumentResponseDto>(
      "/cloudinary-test/upload-document",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("UploadDocument API error:", error);
    throw error;
  }
};

// =====================
// XÓA ASSET (DÙNG CHUNG)
// =====================

export const deleteImage = async (
  publicId: string
): Promise<DeleteAssetResponseDto> => {
  try {
    const response = await axiosInstance.delete<DeleteAssetResponseDto>(
      `/cloudinary-test/delete-image/${publicId}`
    );
    return response.data;
  } catch (error) {
    console.error("DeleteImage API error:", error);
    throw error;
  }
};

export const deleteVideo = async (
  publicId: string
): Promise<DeleteAssetResponseDto> => {
  try {
    const response = await axiosInstance.delete<DeleteAssetResponseDto>(
      `/cloudinary-test/delete-video/${publicId}`
    );
    return response.data;
  } catch (error) {
    console.error("DeleteVideo API error:", error);
    throw error;
  }
};

export const deleteDocument = async (
  publicId: string
): Promise<DeleteAssetResponseDto> => {
  try {
    const response = await axiosInstance.delete<DeleteAssetResponseDto>(
      `/cloudinary-test/delete-document/${publicId}`
    );
    return response.data;
  } catch (error) {
    console.error("DeleteDocument API error:", error);
    throw error;
  }
};

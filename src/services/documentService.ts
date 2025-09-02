import axiosInstance from "../const/axios/axiosInstance";

const BASE_DOCUMENTS_URL = "/documents";

/**
 * Represents a Document data transfer object.
 */
export interface DocumentDto {
  documentId: string;
  lessonId: string;
  documentName: string;
  fileUrl: string;
  uploadedAt: string;
}

/**
 * Fetches a document by its ID.
 * GET /api/documents/{id}
 */
export const getDocumentById = async (id: string): Promise<DocumentDto> => {
  try {
    const response = await axiosInstance.get<DocumentDto>(
      `${BASE_DOCUMENTS_URL}/${id}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching document ${id}:`, error);
    throw error;
  }
};

/**
 * Fetches all documents for a specific lesson.
 * GET /api/documents/lesson/{lessonId}
 */
export const getDocumentsByLessonId = async (
  lessonId: string
): Promise<DocumentDto[]> => {
  try {
    const response = await axiosInstance.get<DocumentDto[]>(
      `${BASE_DOCUMENTS_URL}/lesson/${lessonId}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching documents for lesson ${lessonId}:`, error);
    throw error;
  }
};

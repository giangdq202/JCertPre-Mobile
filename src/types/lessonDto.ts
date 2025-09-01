import { DocumentDto } from "../services/documentService";

/**
 * DTO for reading a lesson
 */
export interface LessonDto {
  lessonId: string;
  courseId: string;
  title: string;
  lessonOrder: number;
  content: string;
  documents?: DocumentDto[];
}

/**
 * DTO for creating a new lesson
 */
export interface CreateLessonDto {
  title: string;
  lessonOrder: number;
  content: string;
}

/**
 * DTO for updating an existing lesson
 */
export interface UpdateLessonDto {
  title?: string;
  lessonOrder?: number;
  content?: string;
}

/**
 * Validation rules for lesson fields
 */
export const LESSON_VALIDATION_RULES = {
  TITLE_MIN_LENGTH: 1,
  TITLE_MAX_LENGTH: 200,
  TITLE_REQUIRED_MESSAGE: "Lesson title is required.",
  TITLE_EMPTY_MESSAGE: "Lesson title cannot be empty.",
  TITLE_TOO_LONG_MESSAGE: "Lesson title cannot exceed 200 characters.",

  LESSON_ORDER_MIN: 1,
  LESSON_ORDER_MAX: 10000,
  LESSON_ORDER_REQUIRED_MESSAGE: "Lesson order is required.",
  LESSON_ORDER_RANGE_MESSAGE:
    "Lesson order must be a positive integer between 1 and 10000.",

  CONTENT_MIN_LENGTH: 1,
  CONTENT_MAX_LENGTH: 5000,
  CONTENT_REQUIRED_MESSAGE: "Lesson content is required.",
  CONTENT_EMPTY_MESSAGE: "Lesson content cannot be empty.",
  CONTENT_TOO_LONG_MESSAGE: "Lesson content cannot exceed 5000 characters.",
} as const;

/**
 * Validate lesson title
 */
export const validateLessonTitle = (
  title: string
): { isValid: boolean; message?: string } => {
  if (!title || title.trim().length === 0) {
    return {
      isValid: false,
      message: LESSON_VALIDATION_RULES.TITLE_EMPTY_MESSAGE,
    };
  }

  if (title.length > LESSON_VALIDATION_RULES.TITLE_MAX_LENGTH) {
    return {
      isValid: false,
      message: LESSON_VALIDATION_RULES.TITLE_TOO_LONG_MESSAGE,
    };
  }

  return { isValid: true };
};

/**
 * Validate lesson order
 */
export const validateLessonOrder = (
  order: number
): { isValid: boolean; message?: string } => {
  if (typeof order !== "number" || isNaN(order)) {
    return {
      isValid: false,
      message: LESSON_VALIDATION_RULES.LESSON_ORDER_REQUIRED_MESSAGE,
    };
  }

  if (
    order < LESSON_VALIDATION_RULES.LESSON_ORDER_MIN ||
    order > LESSON_VALIDATION_RULES.LESSON_ORDER_MAX
  ) {
    return {
      isValid: false,
      message: LESSON_VALIDATION_RULES.LESSON_ORDER_RANGE_MESSAGE,
    };
  }

  return { isValid: true };
};

/**
 * Validate lesson content
 */
export const validateLessonContent = (
  content: string
): { isValid: boolean; message?: string } => {
  if (!content || content.trim().length === 0) {
    return {
      isValid: false,
      message: LESSON_VALIDATION_RULES.CONTENT_EMPTY_MESSAGE,
    };
  }

  if (content.length > LESSON_VALIDATION_RULES.CONTENT_MAX_LENGTH) {
    return {
      isValid: false,
      message: LESSON_VALIDATION_RULES.CONTENT_TOO_LONG_MESSAGE,
    };
  }

  return { isValid: true };
};

/**
 * Validate lesson creation DTO
 */
export const validateLessonCreateDto = (
  dto: CreateLessonDto
): { isValid: boolean; message?: string } => {
  const titleValidation = validateLessonTitle(dto.title);
  if (!titleValidation.isValid) return titleValidation;

  const orderValidation = validateLessonOrder(dto.lessonOrder);
  if (!orderValidation.isValid) return orderValidation;

  const contentValidation = validateLessonContent(dto.content);
  if (!contentValidation.isValid) return contentValidation;

  return { isValid: true };
};

/**
 * Validate lesson update DTO
 */
export const validateLessonUpdateDto = (
  dto: UpdateLessonDto
): { isValid: boolean; message?: string } => {
  if (dto.title !== undefined) {
    const titleValidation = validateLessonTitle(dto.title);
    if (!titleValidation.isValid) return titleValidation;
  }

  if (dto.lessonOrder !== undefined) {
    const orderValidation = validateLessonOrder(dto.lessonOrder);
    if (!orderValidation.isValid) return orderValidation;
  }

  if (dto.content !== undefined) {
    const contentValidation = validateLessonContent(dto.content);
    if (!contentValidation.isValid) return contentValidation;
  }

  return { isValid: true };
};

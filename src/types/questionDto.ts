import { ChoiceReadDto } from "./choiceDto";

/**
 * Question difficulty levels
 */
export enum QuestionDifficulty {
  Easy = 0,
  Medium = 1,
  Hard = 2,
}

/**
 * Content names for questions
 */
export enum ContentName {
  Kanji = 0,
  Vocabulary = 1,
  Grammar = 2,
  Reading = 3,
  Listening = 4,
}

/**
 * Course levels
 */
export enum CourseLevel {
  N5 = 0,
  N4 = 1,
  N3 = 2,
  N2 = 3,
  N1 = 4,
}

/**
 * Sub-content names for questions
 */
export enum SubContentName {
  Mondai1 = 0,
  Mondai2 = 1,
  Mondai3 = 2,
  Mondai4 = 3,
  Mondai5 = 4,
  Mondai6 = 5,
  Mondai7 = 6,
  Mondai8 = 7,
  Mondai9 = 8,
  Mondai10 = 9,
  Mondai11 = 10,
  Mondai12 = 11,
  Mondai13 = 12,
  Mondai14 = 13,
}

/**
 * Question read DTO
 */
export interface QuestionDto {
  id: string;
  content: string;
  explanation?: string;
  points: number;
  difficulty: QuestionDifficulty;
  isActive: boolean;
  contentName: ContentName;
  level: CourseLevel;
  subContentName: SubContentName;
  audioFile?: string;
  choices?: ChoiceReadDto[];
  questionAttachments?: Array<{ mediaUrl: string; mediaType: string }>;
}

/**
 * Create question DTO
 */
export interface CreateQuestionDto {
  content: string;
  explanation?: string;
  points: number;
  difficulty: QuestionDifficulty;
  isActive: boolean;
  contentName: ContentName;
  level: CourseLevel;
  subContentName: SubContentName;
  audioFile?: File;
}

/**
 * Update question DTO
 */
export interface UpdateQuestionDto {
  content?: string;
  explanation?: string;
  points?: number;
  difficulty?: QuestionDifficulty;
  isActive?: boolean;
  contentName?: ContentName;
  level?: CourseLevel;
  subContentName?: SubContentName;
  audioFile?: File;
}

/**
 * Validation rules
 */
export const QUESTION_VALIDATION_RULES = {
  CONTENT_MIN_LENGTH: 10,
  CONTENT_MAX_LENGTH: 1000,
  CONTENT_REQUIRED_MESSAGE: "Question content is required.",
  CONTENT_TOO_SHORT_MESSAGE: "Question content must be at least 10 characters.",
  CONTENT_TOO_LONG_MESSAGE: "Question content cannot exceed 1000 characters.",

  EXPLANATION_MAX_LENGTH: 1000,
  EXPLANATION_TOO_LONG_MESSAGE: "Explanation cannot exceed 1000 characters.",

  POINTS_MIN: 1,
  POINTS_MAX: 100,
  POINTS_REQUIRED_MESSAGE: "Points are required.",
  POINTS_RANGE_MESSAGE: "Points must be between 1 and 100.",

  DIFFICULTY_REQUIRED_MESSAGE: "Difficulty is required.",
  IS_ACTIVE_REQUIRED_MESSAGE: "IsActive is required.",
  CONTENT_NAME_REQUIRED_MESSAGE: "ContentName is required.",
  LEVEL_REQUIRED_MESSAGE: "Level is required.",
  SUB_CONTENT_NAME_REQUIRED_MESSAGE: "SubContentName is required.",
} as const;

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Validators
 */
export const validateQuestionContent = (content: string): ValidationResult => {
  if (!content || content.trim().length === 0)
    return {
      isValid: false,
      message: QUESTION_VALIDATION_RULES.CONTENT_REQUIRED_MESSAGE,
    };
  if (content.trim().length < QUESTION_VALIDATION_RULES.CONTENT_MIN_LENGTH)
    return {
      isValid: false,
      message: QUESTION_VALIDATION_RULES.CONTENT_TOO_SHORT_MESSAGE,
    };
  if (content.length > QUESTION_VALIDATION_RULES.CONTENT_MAX_LENGTH)
    return {
      isValid: false,
      message: QUESTION_VALIDATION_RULES.CONTENT_TOO_LONG_MESSAGE,
    };
  return { isValid: true };
};

export const validateQuestionExplanation = (
  explanation?: string
): ValidationResult => {
  if (
    explanation &&
    explanation.length > QUESTION_VALIDATION_RULES.EXPLANATION_MAX_LENGTH
  )
    return {
      isValid: false,
      message: QUESTION_VALIDATION_RULES.EXPLANATION_TOO_LONG_MESSAGE,
    };
  return { isValid: true };
};

export const validateQuestionPoints = (points: number): ValidationResult => {
  if (typeof points !== "number" || isNaN(points))
    return {
      isValid: false,
      message: QUESTION_VALIDATION_RULES.POINTS_REQUIRED_MESSAGE,
    };
  if (
    points < QUESTION_VALIDATION_RULES.POINTS_MIN ||
    points > QUESTION_VALIDATION_RULES.POINTS_MAX
  )
    return {
      isValid: false,
      message: QUESTION_VALIDATION_RULES.POINTS_RANGE_MESSAGE,
    };
  return { isValid: true };
};

/**
 * Validate Create DTO
 */
export const validateQuestionCreateDto = (
  dto: CreateQuestionDto
): ValidationResult => {
  let result = validateQuestionContent(dto.content);
  if (!result.isValid) return result;

  result = validateQuestionExplanation(dto.explanation);
  if (!result.isValid) return result;

  result = validateQuestionPoints(dto.points);
  if (!result.isValid) return result;

  if (dto.difficulty === null || dto.difficulty === undefined)
    return {
      isValid: false,
      message: QUESTION_VALIDATION_RULES.DIFFICULTY_REQUIRED_MESSAGE,
    };
  if (typeof dto.isActive !== "boolean")
    return {
      isValid: false,
      message: QUESTION_VALIDATION_RULES.IS_ACTIVE_REQUIRED_MESSAGE,
    };
  if (dto.contentName === null || dto.contentName === undefined)
    return {
      isValid: false,
      message: QUESTION_VALIDATION_RULES.CONTENT_NAME_REQUIRED_MESSAGE,
    };
  if (dto.level === null || dto.level === undefined)
    return {
      isValid: false,
      message: QUESTION_VALIDATION_RULES.LEVEL_REQUIRED_MESSAGE,
    };
  if (dto.subContentName === null || dto.subContentName === undefined)
    return {
      isValid: false,
      message: QUESTION_VALIDATION_RULES.SUB_CONTENT_NAME_REQUIRED_MESSAGE,
    };

  return { isValid: true };
};

/**
 * Validate Update DTO
 */
export const validateQuestionUpdateDto = (
  dto: UpdateQuestionDto
): ValidationResult => {
  if (dto.content !== undefined) {
    const result = validateQuestionContent(dto.content);
    if (!result.isValid) return result;
  }
  if (dto.explanation !== undefined) {
    const result = validateQuestionExplanation(dto.explanation);
    if (!result.isValid) return result;
  }
  if (dto.points !== undefined) {
    const result = validateQuestionPoints(dto.points);
    if (!result.isValid) return result;
  }
  return { isValid: true };
};

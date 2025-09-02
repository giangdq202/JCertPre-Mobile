/**
 * DTO for reading a choice
 */
export interface ChoiceReadDto {
  choiceId: string;
  questionId: string;
  content: string;
  isCorrect: boolean;
}

/**
 * DTO for creating a new choice
 */
export interface ChoiceCreateDto {
  content: string;
  isCorrect: boolean;
}

/**
 * DTO for updating an existing choice
 */
export interface ChoiceUpdateDto {
  content?: string;
  isCorrect?: boolean;
}

/**
 * Validation rules for choice content
 */
export const CHOICE_VALIDATION_RULES = {
  CONTENT_MIN_LENGTH: 1,
  CONTENT_MAX_LENGTH: 500,
  CONTENT_REQUIRED_MESSAGE: "Choice content is required.",
  CONTENT_EMPTY_MESSAGE: "Choice content cannot be empty.",
  CONTENT_TOO_LONG_MESSAGE: "Choice content cannot exceed 500 characters.",
  IS_CORRECT_REQUIRED_MESSAGE: "IsCorrect is required.",
} as const;

/**
 * Validate choice content
 */
export const validateChoiceContent = (
  content: string
): { isValid: boolean; message?: string } => {
  if (!content || content.trim().length === 0) {
    return {
      isValid: false,
      message: CHOICE_VALIDATION_RULES.CONTENT_EMPTY_MESSAGE,
    };
  }

  if (content.length > CHOICE_VALIDATION_RULES.CONTENT_MAX_LENGTH) {
    return {
      isValid: false,
      message: CHOICE_VALIDATION_RULES.CONTENT_TOO_LONG_MESSAGE,
    };
  }

  return { isValid: true };
};

/**
 * Validate DTO for creating a choice
 */
export const validateChoiceCreateDto = (
  dto: ChoiceCreateDto
): { isValid: boolean; message?: string } => {
  if (!dto.content || dto.content.trim().length === 0) {
    return {
      isValid: false,
      message: CHOICE_VALIDATION_RULES.CONTENT_REQUIRED_MESSAGE,
    };
  }

  const contentValidation = validateChoiceContent(dto.content);
  if (!contentValidation.isValid) return contentValidation;

  if (dto.isCorrect === undefined || dto.isCorrect === null) {
    return {
      isValid: false,
      message: CHOICE_VALIDATION_RULES.IS_CORRECT_REQUIRED_MESSAGE,
    };
  }

  return { isValid: true };
};

/**
 * Validate DTO for updating a choice
 */
export const validateChoiceUpdateDto = (
  dto: ChoiceUpdateDto
): { isValid: boolean; message?: string } => {
  if (dto.content !== undefined) {
    const contentValidation = validateChoiceContent(dto.content);
    if (!contentValidation.isValid) return contentValidation;
  }

  return { isValid: true };
};

/**
 * Represents an answer given for a test attempt
 */
export interface AttemptAnswerDto {
  attemptAnswerId: string;
  attemptId: string;
  questionId: string;
  choiceId?: string;
  textAnswer?: string;
}

/**
 * DTO for creating a new attempt answer
 */
export interface CreateAttemptAnswerDto {
  attemptId: string;
  questionId: string;
  choiceId: string;
}

/**
 * DTO for updating an existing attempt answer
 */
export interface UpdateAttemptAnswerDto {
  answerId: string;
  choiceId: string;
}

/**
 * Legacy DTO for backward compatibility
 */
export interface AddOrUpdateAttemptAnswerDto {
  attemptId: string;
  questionId: string;
  choiceId: string;
}

/**
 * Validation functions
 */
export const validateCreateAttemptAnswerDto = (
  dto: CreateAttemptAnswerDto
): { isValid: boolean; message?: string } => {
  if (!dto.attemptId || dto.attemptId.trim().length === 0) {
    return { isValid: false, message: "AttemptId is required." };
  }
  if (!dto.questionId || dto.questionId.trim().length === 0) {
    return { isValid: false, message: "QuestionId is required." };
  }
  if (!dto.choiceId || dto.choiceId.trim().length === 0) {
    return { isValid: false, message: "ChoiceId is required." };
  }
  return { isValid: true };
};

export const validateUpdateAttemptAnswerDto = (
  dto: UpdateAttemptAnswerDto
): { isValid: boolean; message?: string } => {
  if (!dto.answerId || dto.answerId.trim().length === 0) {
    return { isValid: false, message: "AnswerId is required." };
  }
  if (!dto.choiceId || dto.choiceId.trim().length === 0) {
    return { isValid: false, message: "ChoiceId is required." };
  }
  return { isValid: true };
};

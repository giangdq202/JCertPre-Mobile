/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Test Template Config read DTO
 */
export interface TestTemplateConfigDto {
  configId: string;
  templateId: string;
  subContentId: string;
  questionCount: number;
  pointPerQuestion: number;
  totalPoints: number;
  sequence: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create Test Template Config DTO
 */
export interface CreateTestTemplateConfigDto {
  subContentId: string;
  questionCount: number;
  pointPerQuestion: number;
  totalPoints: number;
  sequence: number;
}

/**
 * Update Test Template Config DTO
 */
export interface UpdateTestTemplateConfigDto {
  questionCount?: number;
  pointPerQuestion?: number;
  totalPoints?: number;
  sequence?: number;
}

/**
 * Validation rules
 */
export const TEST_TEMPLATE_CONFIG_VALIDATION_RULES = {
  SUB_CONTENT_ID_REQUIRED_MESSAGE: "SubContentId is required.",
  SUB_CONTENT_ID_INVALID_GUID_MESSAGE: "SubContentId must be a valid GUID.",

  QUESTION_COUNT_REQUIRED_MESSAGE: "Question count is required.",
  QUESTION_COUNT_MIN: 1,
  QUESTION_COUNT_MAX: 1000,
  QUESTION_COUNT_RANGE_MESSAGE: "Question count must be between 1 and 1000.",

  POINT_PER_QUESTION_REQUIRED_MESSAGE: "Point per question is required.",
  POINT_PER_QUESTION_MIN: 1,
  POINT_PER_QUESTION_MAX: 100,
  POINT_PER_QUESTION_RANGE_MESSAGE:
    "Point per question must be between 1 and 100.",

  TOTAL_POINTS_REQUIRED_MESSAGE: "Total points is required.",
  TOTAL_POINTS_MIN: 1,
  TOTAL_POINTS_MAX: 10000,
  TOTAL_POINTS_RANGE_MESSAGE: "Total points must be between 1 and 10000.",

  SEQUENCE_REQUIRED_MESSAGE: "Sequence is required.",
  SEQUENCE_MIN: 1,
  SEQUENCE_MAX: 1000,
  SEQUENCE_RANGE_MESSAGE: "Sequence must be between 1 and 1000.",
} as const;

/**
 * Utility function to validate GUID format
 */
export const isValidGuid = (guid: string): boolean => {
  const guidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return guidRegex.test(guid);
};

/**
 * Validators
 */
export const validateQuestionCount = (count: number): ValidationResult => {
  if (typeof count !== "number" || isNaN(count)) {
    return {
      isValid: false,
      message:
        TEST_TEMPLATE_CONFIG_VALIDATION_RULES.QUESTION_COUNT_REQUIRED_MESSAGE,
    };
  }
  if (
    count < TEST_TEMPLATE_CONFIG_VALIDATION_RULES.QUESTION_COUNT_MIN ||
    count > TEST_TEMPLATE_CONFIG_VALIDATION_RULES.QUESTION_COUNT_MAX
  ) {
    return {
      isValid: false,
      message:
        TEST_TEMPLATE_CONFIG_VALIDATION_RULES.QUESTION_COUNT_RANGE_MESSAGE,
    };
  }
  return { isValid: true };
};

export const validatePointPerQuestion = (points: number): ValidationResult => {
  if (typeof points !== "number" || isNaN(points)) {
    return {
      isValid: false,
      message:
        TEST_TEMPLATE_CONFIG_VALIDATION_RULES.POINT_PER_QUESTION_REQUIRED_MESSAGE,
    };
  }
  if (
    points < TEST_TEMPLATE_CONFIG_VALIDATION_RULES.POINT_PER_QUESTION_MIN ||
    points > TEST_TEMPLATE_CONFIG_VALIDATION_RULES.POINT_PER_QUESTION_MAX
  ) {
    return {
      isValid: false,
      message:
        TEST_TEMPLATE_CONFIG_VALIDATION_RULES.POINT_PER_QUESTION_RANGE_MESSAGE,
    };
  }
  return { isValid: true };
};

export const validateTotalPoints = (points: number): ValidationResult => {
  if (typeof points !== "number" || isNaN(points)) {
    return {
      isValid: false,
      message:
        TEST_TEMPLATE_CONFIG_VALIDATION_RULES.TOTAL_POINTS_REQUIRED_MESSAGE,
    };
  }
  if (
    points < TEST_TEMPLATE_CONFIG_VALIDATION_RULES.TOTAL_POINTS_MIN ||
    points > TEST_TEMPLATE_CONFIG_VALIDATION_RULES.TOTAL_POINTS_MAX
  ) {
    return {
      isValid: false,
      message: TEST_TEMPLATE_CONFIG_VALIDATION_RULES.TOTAL_POINTS_RANGE_MESSAGE,
    };
  }
  return { isValid: true };
};

export const validateSequence = (sequence: number): ValidationResult => {
  if (typeof sequence !== "number" || isNaN(sequence)) {
    return {
      isValid: false,
      message: TEST_TEMPLATE_CONFIG_VALIDATION_RULES.SEQUENCE_REQUIRED_MESSAGE,
    };
  }
  if (
    sequence < TEST_TEMPLATE_CONFIG_VALIDATION_RULES.SEQUENCE_MIN ||
    sequence > TEST_TEMPLATE_CONFIG_VALIDATION_RULES.SEQUENCE_MAX
  ) {
    return {
      isValid: false,
      message: TEST_TEMPLATE_CONFIG_VALIDATION_RULES.SEQUENCE_RANGE_MESSAGE,
    };
  }
  return { isValid: true };
};

/**
 * Validate create DTO
 */
export const validateCreateTestTemplateConfigDto = (
  dto: CreateTestTemplateConfigDto
): ValidationResult => {
  if (!dto.subContentId || dto.subContentId.trim().length === 0) {
    return {
      isValid: false,
      message:
        TEST_TEMPLATE_CONFIG_VALIDATION_RULES.SUB_CONTENT_ID_REQUIRED_MESSAGE,
    };
  }
  if (!isValidGuid(dto.subContentId)) {
    return {
      isValid: false,
      message:
        TEST_TEMPLATE_CONFIG_VALIDATION_RULES.SUB_CONTENT_ID_INVALID_GUID_MESSAGE,
    };
  }

  let result = validateQuestionCount(dto.questionCount);
  if (!result.isValid) return result;

  result = validatePointPerQuestion(dto.pointPerQuestion);
  if (!result.isValid) return result;

  result = validateTotalPoints(dto.totalPoints);
  if (!result.isValid) return result;

  result = validateSequence(dto.sequence);
  if (!result.isValid) return result;

  return { isValid: true };
};

/**
 * Validate update DTO
 */
export const validateUpdateTestTemplateConfigDto = (
  dto: UpdateTestTemplateConfigDto
): ValidationResult => {
  if (dto.questionCount !== undefined) {
    const result = validateQuestionCount(dto.questionCount);
    if (!result.isValid) return result;
  }

  if (dto.pointPerQuestion !== undefined) {
    const result = validatePointPerQuestion(dto.pointPerQuestion);
    if (!result.isValid) return result;
  }

  if (dto.totalPoints !== undefined) {
    const result = validateTotalPoints(dto.totalPoints);
    if (!result.isValid) return result;
  }

  if (dto.sequence !== undefined) {
    const result = validateSequence(dto.sequence);
    if (!result.isValid) return result;
  }

  return { isValid: true };
};

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Test Template read DTO
 */
export interface TestTemplateDto {
  testTemplateId: string;
  testTemplateTypeId: string;
  templateName: string;
  durationMinutes: number;
  totalScore: number;
  toPassPercentage: number;
  sequence: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create test template DTO
 */
export interface CreateTestTemplateDto {
  testTemplateTypeId: string;
  templateName: string;
  durationMinutes: number;
  totalScore: number;
  toPassPercentage: number;
  sequence: number;
}

/**
 * Update test template DTO
 */
export interface UpdateTestTemplateDto {
  templateName?: string;
  durationMinutes?: number;
  totalScore?: number;
  toPassPercentage?: number;
  sequence?: number;
}

/**
 * Validation rules
 */
export const TEST_TEMPLATE_VALIDATION_RULES = {
  TEST_TEMPLATE_TYPE_ID_REQUIRED_MESSAGE: "TestTemplateTypeId is required.",
  TEST_TEMPLATE_TYPE_ID_INVALID_GUID_MESSAGE:
    "TestTemplateTypeId must be a valid GUID.",

  TEMPLATE_NAME_REQUIRED_MESSAGE: "Template name is required.",
  TEMPLATE_NAME_MIN_LENGTH: 3,
  TEMPLATE_NAME_MAX_LENGTH: 200,
  TEMPLATE_NAME_TOO_SHORT_MESSAGE:
    "Template name must be at least 3 characters.",
  TEMPLATE_NAME_TOO_LONG_MESSAGE: "Template name cannot exceed 200 characters.",

  DURATION_MINUTES_REQUIRED_MESSAGE: "Duration minutes is required.",
  DURATION_MINUTES_MIN: 1,
  DURATION_MINUTES_MAX: 1000,
  DURATION_MINUTES_RANGE_MESSAGE:
    "Duration minutes must be between 1 and 1000.",

  TOTAL_SCORE_REQUIRED_MESSAGE: "Total score is required.",
  TOTAL_SCORE_MIN: 1,
  TOTAL_SCORE_MAX: 10000,
  TOTAL_SCORE_RANGE_MESSAGE: "Total score must be between 1 and 10000.",

  TO_PASS_PERCENTAGE_REQUIRED_MESSAGE: "To pass percentage is required.",
  TO_PASS_PERCENTAGE_MIN: 0,
  TO_PASS_PERCENTAGE_MAX: 100,
  TO_PASS_PERCENTAGE_RANGE_MESSAGE:
    "To pass percentage must be between 0 and 100.",

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
export const validateTemplateName = (name: string): ValidationResult => {
  if (!name || name.trim().length === 0) {
    return {
      isValid: false,
      message: TEST_TEMPLATE_VALIDATION_RULES.TEMPLATE_NAME_REQUIRED_MESSAGE,
    };
  }
  if (
    name.trim().length < TEST_TEMPLATE_VALIDATION_RULES.TEMPLATE_NAME_MIN_LENGTH
  ) {
    return {
      isValid: false,
      message: TEST_TEMPLATE_VALIDATION_RULES.TEMPLATE_NAME_TOO_SHORT_MESSAGE,
    };
  }
  if (
    name.trim().length > TEST_TEMPLATE_VALIDATION_RULES.TEMPLATE_NAME_MAX_LENGTH
  ) {
    return {
      isValid: false,
      message: TEST_TEMPLATE_VALIDATION_RULES.TEMPLATE_NAME_TOO_LONG_MESSAGE,
    };
  }
  return { isValid: true };
};

export const validateDurationMinutes = (duration: number): ValidationResult => {
  if (typeof duration !== "number" || isNaN(duration)) {
    return {
      isValid: false,
      message: TEST_TEMPLATE_VALIDATION_RULES.DURATION_MINUTES_REQUIRED_MESSAGE,
    };
  }
  if (
    duration < TEST_TEMPLATE_VALIDATION_RULES.DURATION_MINUTES_MIN ||
    duration > TEST_TEMPLATE_VALIDATION_RULES.DURATION_MINUTES_MAX
  ) {
    return {
      isValid: false,
      message: TEST_TEMPLATE_VALIDATION_RULES.DURATION_MINUTES_RANGE_MESSAGE,
    };
  }
  return { isValid: true };
};

export const validateTotalScore = (score: number): ValidationResult => {
  if (typeof score !== "number" || isNaN(score)) {
    return {
      isValid: false,
      message: TEST_TEMPLATE_VALIDATION_RULES.TOTAL_SCORE_REQUIRED_MESSAGE,
    };
  }
  if (
    score < TEST_TEMPLATE_VALIDATION_RULES.TOTAL_SCORE_MIN ||
    score > TEST_TEMPLATE_VALIDATION_RULES.TOTAL_SCORE_MAX
  ) {
    return {
      isValid: false,
      message: TEST_TEMPLATE_VALIDATION_RULES.TOTAL_SCORE_RANGE_MESSAGE,
    };
  }
  return { isValid: true };
};

export const validateToPassPercentage = (
  percentage: number
): ValidationResult => {
  if (typeof percentage !== "number" || isNaN(percentage)) {
    return {
      isValid: false,
      message:
        TEST_TEMPLATE_VALIDATION_RULES.TO_PASS_PERCENTAGE_REQUIRED_MESSAGE,
    };
  }
  if (
    percentage < TEST_TEMPLATE_VALIDATION_RULES.TO_PASS_PERCENTAGE_MIN ||
    percentage > TEST_TEMPLATE_VALIDATION_RULES.TO_PASS_PERCENTAGE_MAX
  ) {
    return {
      isValid: false,
      message: TEST_TEMPLATE_VALIDATION_RULES.TO_PASS_PERCENTAGE_RANGE_MESSAGE,
    };
  }
  return { isValid: true };
};

export const validateSequence = (sequence: number): ValidationResult => {
  if (typeof sequence !== "number" || isNaN(sequence)) {
    return {
      isValid: false,
      message: TEST_TEMPLATE_VALIDATION_RULES.SEQUENCE_REQUIRED_MESSAGE,
    };
  }
  if (
    sequence < TEST_TEMPLATE_VALIDATION_RULES.SEQUENCE_MIN ||
    sequence > TEST_TEMPLATE_VALIDATION_RULES.SEQUENCE_MAX
  ) {
    return {
      isValid: false,
      message: TEST_TEMPLATE_VALIDATION_RULES.SEQUENCE_RANGE_MESSAGE,
    };
  }
  return { isValid: true };
};

/**
 * Validate create DTO
 */
export const validateCreateTestTemplateDto = (
  dto: CreateTestTemplateDto
): ValidationResult => {
  if (!dto.testTemplateTypeId || dto.testTemplateTypeId.trim().length === 0) {
    return {
      isValid: false,
      message:
        TEST_TEMPLATE_VALIDATION_RULES.TEST_TEMPLATE_TYPE_ID_REQUIRED_MESSAGE,
    };
  }
  if (!isValidGuid(dto.testTemplateTypeId)) {
    return {
      isValid: false,
      message:
        TEST_TEMPLATE_VALIDATION_RULES.TEST_TEMPLATE_TYPE_ID_INVALID_GUID_MESSAGE,
    };
  }

  let result = validateTemplateName(dto.templateName);
  if (!result.isValid) return result;

  result = validateDurationMinutes(dto.durationMinutes);
  if (!result.isValid) return result;

  result = validateTotalScore(dto.totalScore);
  if (!result.isValid) return result;

  result = validateToPassPercentage(dto.toPassPercentage);
  if (!result.isValid) return result;

  result = validateSequence(dto.sequence);
  if (!result.isValid) return result;

  return { isValid: true };
};

/**
 * Validate update DTO
 */
export const validateUpdateTestTemplateDto = (
  dto: UpdateTestTemplateDto
): ValidationResult => {
  if (dto.templateName !== undefined) {
    const result = validateTemplateName(dto.templateName);
    if (!result.isValid) return result;
  }

  if (dto.durationMinutes !== undefined) {
    const result = validateDurationMinutes(dto.durationMinutes);
    if (!result.isValid) return result;
  }

  if (dto.totalScore !== undefined) {
    const result = validateTotalScore(dto.totalScore);
    if (!result.isValid) return result;
  }

  if (dto.toPassPercentage !== undefined) {
    const result = validateToPassPercentage(dto.toPassPercentage);
    if (!result.isValid) return result;
  }

  if (dto.sequence !== undefined) {
    const result = validateSequence(dto.sequence);
    if (!result.isValid) return result;
  }

  return { isValid: true };
};

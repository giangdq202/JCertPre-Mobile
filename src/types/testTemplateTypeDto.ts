/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Enums
 */
export enum CourseLevel {
  N5 = 0,
  N4 = 1,
  N3 = 2,
  N2 = 3,
  N1 = 4,
}

export enum TestType {
  JLPTAuto = 0,
  EntryAuto = 1,
  CustomManual = 2,
  CustomAuto = 3,
}

/**
 * Test Template Type DTO
 */
export interface TestTemplateTypeDto {
  testTemplateTypeId: string;
  userId: string;
  typeName: string;
  courseLevel: CourseLevel;
  testType: TestType;
  description: string;
  totalTestScore: number;
  totalPassPercentage: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create DTO
 */
export interface CreateTestTemplateTypeDto {
  userId: string;
  typeName: string;
  courseLevel: CourseLevel;
  testType: TestType;
  description: string;
  totalTestScore: number;
  totalPassPercentage: number;
}

/**
 * Update DTO
 */
export interface UpdateTestTemplateTypeDto {
  typeName?: string;
  courseLevel?: CourseLevel;
  testType?: TestType;
  description?: string;
  isActive?: boolean;
  totalTestScore?: number;
  totalPassPercentage?: number;
}

/**
 * Validation rules
 */
export const TEST_TEMPLATE_TYPE_VALIDATION_RULES = {
  USER_ID_REQUIRED_MESSAGE: "UserId is required.",
  USER_ID_INVALID_GUID_MESSAGE: "UserId must be a valid GUID.",

  TYPE_NAME_REQUIRED_MESSAGE: "Type name is required.",
  TYPE_NAME_MIN_LENGTH: 3,
  TYPE_NAME_MAX_LENGTH: 200,
  TYPE_NAME_TOO_SHORT_MESSAGE: "Type name must be at least 3 characters.",
  TYPE_NAME_TOO_LONG_MESSAGE: "Type name cannot exceed 200 characters.",

  COURSE_LEVEL_REQUIRED_MESSAGE: "Course level is required.",
  TEST_TYPE_REQUIRED_MESSAGE: "Test type is required.",

  DESCRIPTION_REQUIRED_MESSAGE: "Description is required.",
  DESCRIPTION_MAX_LENGTH: 1000,
  DESCRIPTION_TOO_LONG_MESSAGE: "Description cannot exceed 1000 characters.",

  TOTAL_TEST_SCORE_REQUIRED_MESSAGE: "Total test score is required.",
  TOTAL_TEST_SCORE_MIN: 1,
  TOTAL_TEST_SCORE_MAX: 1000,
  TOTAL_TEST_SCORE_RANGE_MESSAGE:
    "Total test score must be between 1 and 1000.",

  TOTAL_PASS_PERCENTAGE_REQUIRED_MESSAGE: "Total pass percentage is required.",
  TOTAL_PASS_PERCENTAGE_MIN: 0,
  TOTAL_PASS_PERCENTAGE_MAX: 100,
  TOTAL_PASS_PERCENTAGE_RANGE_MESSAGE:
    "Total pass percentage must be between 0 and 100.",
} as const;

/**
 * Validate GUID
 */
export const isValidGuid = (guid: string): boolean => {
  const guidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return guidRegex.test(guid);
};

/**
 * Validators
 */
export const validateTypeName = (name: string): ValidationResult => {
  if (!name || name.trim().length === 0)
    return {
      isValid: false,
      message: TEST_TEMPLATE_TYPE_VALIDATION_RULES.TYPE_NAME_REQUIRED_MESSAGE,
    };
  if (
    name.trim().length <
    TEST_TEMPLATE_TYPE_VALIDATION_RULES.TYPE_NAME_MIN_LENGTH
  )
    return {
      isValid: false,
      message: TEST_TEMPLATE_TYPE_VALIDATION_RULES.TYPE_NAME_TOO_SHORT_MESSAGE,
    };
  if (
    name.trim().length >
    TEST_TEMPLATE_TYPE_VALIDATION_RULES.TYPE_NAME_MAX_LENGTH
  )
    return {
      isValid: false,
      message: TEST_TEMPLATE_TYPE_VALIDATION_RULES.TYPE_NAME_TOO_LONG_MESSAGE,
    };
  return { isValid: true };
};

export const validateDescription = (description: string): ValidationResult => {
  if (!description || description.trim().length === 0)
    return {
      isValid: false,
      message: TEST_TEMPLATE_TYPE_VALIDATION_RULES.DESCRIPTION_REQUIRED_MESSAGE,
    };
  if (
    description.trim().length >
    TEST_TEMPLATE_TYPE_VALIDATION_RULES.DESCRIPTION_MAX_LENGTH
  )
    return {
      isValid: false,
      message: TEST_TEMPLATE_TYPE_VALIDATION_RULES.DESCRIPTION_TOO_LONG_MESSAGE,
    };
  return { isValid: true };
};

export const validateTotalTestScore = (score: number): ValidationResult => {
  if (typeof score !== "number" || isNaN(score))
    return {
      isValid: false,
      message:
        TEST_TEMPLATE_TYPE_VALIDATION_RULES.TOTAL_TEST_SCORE_REQUIRED_MESSAGE,
    };
  if (
    score < TEST_TEMPLATE_TYPE_VALIDATION_RULES.TOTAL_TEST_SCORE_MIN ||
    score > TEST_TEMPLATE_TYPE_VALIDATION_RULES.TOTAL_TEST_SCORE_MAX
  )
    return {
      isValid: false,
      message:
        TEST_TEMPLATE_TYPE_VALIDATION_RULES.TOTAL_TEST_SCORE_RANGE_MESSAGE,
    };
  return { isValid: true };
};

export const validateTotalPassPercentage = (
  percentage: number
): ValidationResult => {
  if (typeof percentage !== "number" || isNaN(percentage))
    return {
      isValid: false,
      message:
        TEST_TEMPLATE_TYPE_VALIDATION_RULES.TOTAL_PASS_PERCENTAGE_REQUIRED_MESSAGE,
    };
  if (
    percentage <
      TEST_TEMPLATE_TYPE_VALIDATION_RULES.TOTAL_PASS_PERCENTAGE_MIN ||
    percentage > TEST_TEMPLATE_TYPE_VALIDATION_RULES.TOTAL_PASS_PERCENTAGE_MAX
  )
    return {
      isValid: false,
      message:
        TEST_TEMPLATE_TYPE_VALIDATION_RULES.TOTAL_PASS_PERCENTAGE_RANGE_MESSAGE,
    };
  return { isValid: true };
};

/**
 * Validate create DTO
 */
export const validateCreateTestTemplateTypeDto = (
  dto: CreateTestTemplateTypeDto
): ValidationResult => {
  if (!dto.userId || dto.userId.trim().length === 0)
    return {
      isValid: false,
      message: TEST_TEMPLATE_TYPE_VALIDATION_RULES.USER_ID_REQUIRED_MESSAGE,
    };
  if (!isValidGuid(dto.userId))
    return {
      isValid: false,
      message: TEST_TEMPLATE_TYPE_VALIDATION_RULES.USER_ID_INVALID_GUID_MESSAGE,
    };

  let result = validateTypeName(dto.typeName);
  if (!result.isValid) return result;

  if (dto.courseLevel === null || dto.courseLevel === undefined)
    return {
      isValid: false,
      message:
        TEST_TEMPLATE_TYPE_VALIDATION_RULES.COURSE_LEVEL_REQUIRED_MESSAGE,
    };
  if (dto.testType === null || dto.testType === undefined)
    return {
      isValid: false,
      message: TEST_TEMPLATE_TYPE_VALIDATION_RULES.TEST_TYPE_REQUIRED_MESSAGE,
    };

  result = validateDescription(dto.description);
  if (!result.isValid) return result;

  result = validateTotalTestScore(dto.totalTestScore);
  if (!result.isValid) return result;

  result = validateTotalPassPercentage(dto.totalPassPercentage);
  if (!result.isValid) return result;

  return { isValid: true };
};

/**
 * Validate update DTO
 */
export const validateUpdateTestTemplateTypeDto = (
  dto: UpdateTestTemplateTypeDto
): ValidationResult => {
  if (dto.typeName !== undefined) {
    const result = validateTypeName(dto.typeName);
    if (!result.isValid) return result;
  }
  if (dto.description !== undefined) {
    const result = validateDescription(dto.description);
    if (!result.isValid) return result;
  }
  if (dto.totalTestScore !== undefined) {
    const result = validateTotalTestScore(dto.totalTestScore);
    if (!result.isValid) return result;
  }
  if (dto.totalPassPercentage !== undefined) {
    const result = validateTotalPassPercentage(dto.totalPassPercentage);
    if (!result.isValid) return result;
  }
  return { isValid: true };
};

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Test types
 */
export enum TestType {
  PRACTICE = "Practice",
  QUIZ = "Quiz",
  EXAM = "Exam",
  FINAL = "Final",
}

/**
 * Course levels
 */
export enum CourseLevel {
  N5 = "N5",
  N4 = "N4",
  N3 = "N3",
  N2 = "N2",
  N1 = "N1",
}

/**
 * Test read DTO
 */
export interface TestDto {
  testId: string;
  title: string;
  description?: string;
  testType: TestType;
  courseLevel: CourseLevel;
  durationMinutes: number;
  availableFrom?: Date;
  availableTo?: Date;
  maxAttempts: number;
  passingPercentage: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create test DTO
 */
export interface CreateTestDto {
  title: string;
  description?: string;
  testType: TestType;
  courseLevel: CourseLevel;
  durationMinutes: number;
  availableFrom?: Date;
  availableTo?: Date;
  maxAttempts: number;
  passingPercentage: number;
}

/**
 * Update test DTO
 */
export interface UpdateTestDto {
  title?: string;
  description?: string;
  testType?: TestType;
  courseLevel?: CourseLevel;
  durationMinutes?: number;
  availableFrom?: Date;
  availableTo?: Date;
  maxAttempts?: number;
  passingPercentage?: number;
}

/**
 * Create auto test input DTO
 */
export interface CreateAutoTestInput {
  testType: TestType;
  courseLevel: CourseLevel;
}

/**
 * Validation rules
 */
export const TEST_VALIDATION_RULES = {
  TITLE_MIN_LENGTH: 3,
  TITLE_MAX_LENGTH: 200,
  TITLE_REQUIRED_MESSAGE: "Title is required.",
  TITLE_TOO_SHORT_MESSAGE: "Title must be at least 3 characters.",
  TITLE_TOO_LONG_MESSAGE: "Title cannot exceed 200 characters.",

  DESCRIPTION_MAX_LENGTH: 1000,
  DESCRIPTION_TOO_LONG_MESSAGE: "Description cannot exceed 1000 characters.",

  TEST_TYPE_REQUIRED_MESSAGE: "TestType is required.",
  COURSE_LEVEL_REQUIRED_MESSAGE: "CourseLevel is required.",

  DURATION_MINUTES_MIN: 1,
  DURATION_MINUTES_MAX: 1000,
  DURATION_MINUTES_REQUIRED_MESSAGE: "DurationMinutes is required.",
  DURATION_MINUTES_RANGE_MESSAGE: "DurationMinutes must be between 1 and 1000.",

  MAX_ATTEMPTS_MIN: 1,
  MAX_ATTEMPTS_MAX: 100,
  MAX_ATTEMPTS_REQUIRED_MESSAGE: "MaxAttempts is required.",
  MAX_ATTEMPTS_RANGE_MESSAGE: "MaxAttempts must be between 1 and 100.",

  PASSING_PERCENTAGE_MIN: 0,
  PASSING_PERCENTAGE_MAX: 100,
  PASSING_PERCENTAGE_REQUIRED_MESSAGE: "PassingPercentage is required.",
  PASSING_PERCENTAGE_RANGE_MESSAGE:
    "PassingPercentage must be between 0 and 100.",
} as const;

/**
 * Validators
 */
export const validateTestTitle = (title: string): ValidationResult => {
  if (!title || title.trim().length === 0) {
    return {
      isValid: false,
      message: TEST_VALIDATION_RULES.TITLE_REQUIRED_MESSAGE,
    };
  }
  if (title.trim().length < TEST_VALIDATION_RULES.TITLE_MIN_LENGTH) {
    return {
      isValid: false,
      message: TEST_VALIDATION_RULES.TITLE_TOO_SHORT_MESSAGE,
    };
  }
  if (title.length > TEST_VALIDATION_RULES.TITLE_MAX_LENGTH) {
    return {
      isValid: false,
      message: TEST_VALIDATION_RULES.TITLE_TOO_LONG_MESSAGE,
    };
  }
  return { isValid: true };
};

export const validateTestDescription = (
  description?: string
): ValidationResult => {
  if (
    description &&
    description.length > TEST_VALIDATION_RULES.DESCRIPTION_MAX_LENGTH
  ) {
    return {
      isValid: false,
      message: TEST_VALIDATION_RULES.DESCRIPTION_TOO_LONG_MESSAGE,
    };
  }
  return { isValid: true };
};

export const validateTestDurationMinutes = (
  durationMinutes: number
): ValidationResult => {
  if (typeof durationMinutes !== "number" || isNaN(durationMinutes)) {
    return {
      isValid: false,
      message: TEST_VALIDATION_RULES.DURATION_MINUTES_REQUIRED_MESSAGE,
    };
  }
  if (
    durationMinutes < TEST_VALIDATION_RULES.DURATION_MINUTES_MIN ||
    durationMinutes > TEST_VALIDATION_RULES.DURATION_MINUTES_MAX
  ) {
    return {
      isValid: false,
      message: TEST_VALIDATION_RULES.DURATION_MINUTES_RANGE_MESSAGE,
    };
  }
  return { isValid: true };
};

export const validateTestMaxAttempts = (
  maxAttempts: number
): ValidationResult => {
  if (typeof maxAttempts !== "number" || isNaN(maxAttempts)) {
    return {
      isValid: false,
      message: TEST_VALIDATION_RULES.MAX_ATTEMPTS_REQUIRED_MESSAGE,
    };
  }
  if (
    maxAttempts < TEST_VALIDATION_RULES.MAX_ATTEMPTS_MIN ||
    maxAttempts > TEST_VALIDATION_RULES.MAX_ATTEMPTS_MAX
  ) {
    return {
      isValid: false,
      message: TEST_VALIDATION_RULES.MAX_ATTEMPTS_RANGE_MESSAGE,
    };
  }
  return { isValid: true };
};

export const validateTestPassingPercentage = (
  passingPercentage: number
): ValidationResult => {
  if (typeof passingPercentage !== "number" || isNaN(passingPercentage)) {
    return {
      isValid: false,
      message: TEST_VALIDATION_RULES.PASSING_PERCENTAGE_REQUIRED_MESSAGE,
    };
  }
  if (
    passingPercentage < TEST_VALIDATION_RULES.PASSING_PERCENTAGE_MIN ||
    passingPercentage > TEST_VALIDATION_RULES.PASSING_PERCENTAGE_MAX
  ) {
    return {
      isValid: false,
      message: TEST_VALIDATION_RULES.PASSING_PERCENTAGE_RANGE_MESSAGE,
    };
  }
  return { isValid: true };
};

/**
 * Validate Create DTO
 */
export const validateTestCreateDto = (dto: CreateTestDto): ValidationResult => {
  let result = validateTestTitle(dto.title);
  if (!result.isValid) return result;

  result = validateTestDescription(dto.description);
  if (!result.isValid) return result;

  if (dto.testType === undefined || dto.testType === null) {
    return {
      isValid: false,
      message: TEST_VALIDATION_RULES.TEST_TYPE_REQUIRED_MESSAGE,
    };
  }

  if (dto.courseLevel === undefined || dto.courseLevel === null) {
    return {
      isValid: false,
      message: TEST_VALIDATION_RULES.COURSE_LEVEL_REQUIRED_MESSAGE,
    };
  }

  result = validateTestDurationMinutes(dto.durationMinutes);
  if (!result.isValid) return result;

  result = validateTestMaxAttempts(dto.maxAttempts);
  if (!result.isValid) return result;

  result = validateTestPassingPercentage(dto.passingPercentage);
  if (!result.isValid) return result;

  return { isValid: true };
};

/**
 * Validate Update DTO
 */
export const validateTestUpdateDto = (dto: UpdateTestDto): ValidationResult => {
  if (dto.title !== undefined) {
    const result = validateTestTitle(dto.title);
    if (!result.isValid) return result;
  }
  if (dto.description !== undefined) {
    const result = validateTestDescription(dto.description);
    if (!result.isValid) return result;
  }
  if (dto.durationMinutes !== undefined) {
    const result = validateTestDurationMinutes(dto.durationMinutes);
    if (!result.isValid) return result;
  }
  if (dto.maxAttempts !== undefined) {
    const result = validateTestMaxAttempts(dto.maxAttempts);
    if (!result.isValid) return result;
  }
  if (dto.passingPercentage !== undefined) {
    const result = validateTestPassingPercentage(dto.passingPercentage);
    if (!result.isValid) return result;
  }
  return { isValid: true };
};

/**
 * Validate CreateAutoTestInput
 */
export const validateCreateAutoTestInput = (
  dto: CreateAutoTestInput
): ValidationResult => {
  if (dto.testType === undefined || dto.testType === null) {
    return {
      isValid: false,
      message: TEST_VALIDATION_RULES.TEST_TYPE_REQUIRED_MESSAGE,
    };
  }
  if (dto.courseLevel === undefined || dto.courseLevel === null) {
    return {
      isValid: false,
      message: TEST_VALIDATION_RULES.COURSE_LEVEL_REQUIRED_MESSAGE,
    };
  }
  return { isValid: true };
};

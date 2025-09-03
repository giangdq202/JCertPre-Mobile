import { getAllTestAttemptsByUserId } from "../services/testAttemptService";
import type { TestAttemptDto } from "../services/testAttemptService";

/**
 * Kiểm tra học sinh đã pass bài test cụ thể chưa
 * @param userId - ID học sinh
 * @param testId - ID bài test
 * @returns true nếu học sinh có ít nhất một attempt pass
 */
export const hasUserPassedTest = async (
  userId: string,
  testId: string
): Promise<boolean> => {
  try {
    const attempts: TestAttemptDto[] = await getAllTestAttemptsByUserId(userId);
    return attempts.some(
      (attempt) => attempt.testId === testId && attempt.isPass === true
    );
  } catch (error) {
    console.error("Error checking test completion:", error);
    return false;
  }
};

/**
 * Lấy danh sách các testId mà học sinh đã pass
 * @param userId - ID học sinh
 * @returns Set các testId đã pass
 */
export const getUserPassedTestIds = async (
  userId: string
): Promise<Set<string>> => {
  try {
    const attempts: TestAttemptDto[] = await getAllTestAttemptsByUserId(userId);
    const passedTestIds = new Set<string>();
    attempts.forEach((attempt) => {
      if (attempt.isPass === true) {
        passedTestIds.add(attempt.testId);
      }
    });
    return passedTestIds;
  } catch (error) {
    console.error("Error getting passed test IDs:", error);
    return new Set();
  }
};

/**
 * Kiểm tra học sinh có thể qua lesson tiếp theo không
 * @param userId - ID học sinh
 * @param testId - ID bài test (nếu lesson có test)
 * @returns true nếu không có test hoặc đã pass test
 */
export const canUserProceedToNextLesson = async (
  userId: string,
  testId?: string
): Promise<boolean> => {
  if (!testId) return true; 
  return await hasUserPassedTest(userId, testId);
};

/**
 * Lấy tổng hợp trạng thái pass cho nhiều bài test
 * @param userId - ID học sinh
 * @param testIds - danh sách testId
 * @returns Map testId -> isPass
 */
export const getTestCompletionSummary = async (
  userId: string,
  testIds: string[]
): Promise<Map<string, boolean>> => {
  const summary = new Map<string, boolean>();
  testIds.forEach((id) => summary.set(id, false));

  try {
    const attempts: TestAttemptDto[] = await getAllTestAttemptsByUserId(userId);
    attempts.forEach((attempt) => {
      if (attempt.isPass === true && testIds.includes(attempt.testId)) {
        summary.set(attempt.testId, true);
      }
    });
    return summary;
  } catch (error) {
    console.error("Error getting test completion summary:", error);
    return summary;
  }
};

export default {
  hasUserPassedTest,
  getUserPassedTestIds,
  canUserProceedToNextLesson,
  getTestCompletionSummary,
};

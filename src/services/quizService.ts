import axiosInstance from '../const/axios/axiosInstance';
import {
  GetRandomQuestionsRequestDto,
  RandomQuestionWithChoicesDto,
  QuizResult,
  ContentName,
  CourseLevel,
  SubContentName,
} from "../types/quiz";

class QuizService {
  async fetchRandomQuestions(request: GetRandomQuestionsRequestDto): Promise<RandomQuestionWithChoicesDto[]> {
    try {
      console.log('Fetching random questions with request:', request);
      
      // Call real API using authenticated axiosInstance
      const response = await axiosInstance.post<RandomQuestionWithChoicesDto[]>(
        `/questions/random`,
        {
          numberOfQuestions: request.numberOfQuestions,
          contentName: request.contentName,
          level: request.level,
          subContentName: request.subContentName,
        },
        {
          timeout: 10000, // 10 second timeout
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.data && response.data.length > 0) {
        console.log(`Successfully fetched ${response.data.length} questions from API`);
        return response.data;
      } else {
        console.warn('API returned empty data');
        throw new Error('Không tìm thấy câu hỏi phù hợp với cấu hình đã chọn.');
      }
      
    } catch (error: any) {
      console.error('Error in fetchRandomQuestions:', error);
      
      // Provide specific error messages based on error type
      if (error.response?.status === 401) {
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (error.response?.status === 400) {
        throw new Error('Không tìm thấy câu hỏi cho cấu hình này. Vui lòng thử cấu hình khác.');
      } else if (error.response?.status === 500) {
        throw new Error('Lỗi server. Vui lòng thử lại sau.');
      } else if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        throw new Error('Không thể kết nối tới server. Vui lòng kiểm tra kết nối mạng.');
      } else {
        throw new Error(error.message || 'Có lỗi xảy ra khi tải câu hỏi.');
      }
    }
  }

  // Helper methods for content mapping
  getContentNameLabel(contentName: ContentName): string {
    const labels = {
      [ContentName.Kanji]: "Chữ Hán",
      [ContentName.Vocabulary]: "Từ Vựng",
      [ContentName.Grammar]: "Ngữ Pháp",
      [ContentName.Reading]: "Đọc Hiểu",
      [ContentName.Listening]: "Nghe Hiểu",
    };
    return labels[contentName] || "Unknown";
  }

  getCourseLevelLabel(level: CourseLevel): string {
    const labels = {
      [CourseLevel.N5]: "N5",
      [CourseLevel.N4]: "N4",
      [CourseLevel.N3]: "N3",
      [CourseLevel.N2]: "N2",
      [CourseLevel.N1]: "N1",
    };
    return labels[level] || "Unknown";
  }

  getSubContentNameLabel(subContentName: SubContentName): string {
    const labels = {
      [SubContentName.Mondai1]: "Đọc chữ Hán",
      [SubContentName.Mondai2]: "Nhớ chữ Hán",
      [SubContentName.Mondai3]: "Chọn từ phù hợp với câu",
      [SubContentName.Mondai4]: "Tìm câu có cách diễn đạt giống",
      [SubContentName.Mondai5]: "Chọn ngữ pháp phù hợp với câu",
      [SubContentName.Mondai6]: "Sắp xếp câu",
      [SubContentName.Mondai7]: "Tìm đáp án đúng để hoàn thành đoạn văn",
      [SubContentName.Mondai8]: "Đoạn văn ngắn",
      [SubContentName.Mondai9]: "Trung văn",
      [SubContentName.Mondai10]: "Tìm kiếm thông tin",
      [SubContentName.Mondai11]: "Hiểu đề bài",
      [SubContentName.Mondai12]: "Hiểu điểm chính",
      [SubContentName.Mondai13]: "Diễn đạt bằng lời nói",
      [SubContentName.Mondai14]: "Phản hồi tức thời",
    };
    return labels[subContentName] || "Unknown";
  }
}

// Export singleton instance
export const quizService = new QuizService();
export default quizService;

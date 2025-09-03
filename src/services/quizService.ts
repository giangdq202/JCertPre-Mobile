import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {
  GetRandomQuestionsRequestDto,
  RandomQuestionWithChoicesDto,
  QuizResult,
  ContentName,
  CourseLevel,
  SubContentName
} from '../types/quiz';
import { BASE_URL } from '../const/apiUrl/baseUrl';

// Mock data for offline development
const mockQuestions: RandomQuestionWithChoicesDto[] = [
  {
    questionId: '1',
    questionText: 'Chọn cách đọc đúng của chữ Hán "学生"',
    explanation: '"学生" được đọc là "がくせい" (gakusei), có nghĩa là học sinh.',
    choices: [
      { choiceId: '1a', content: 'がくせい', isCorrect: true },
      { choiceId: '1b', content: 'がくしょう', isCorrect: false },
      { choiceId: '1c', content: 'がくじょう', isCorrect: false },
      { choiceId: '1d', content: 'まなびせい', isCorrect: false },
    ],
  },
  {
    questionId: '2',
    questionText: 'Chọn nghĩa đúng của từ "美しい"',
    explanation: '"美しい" (utsukushii) có nghĩa là đẹp.',
    choices: [
      { choiceId: '2a', content: 'xấu', isCorrect: false },
      { choiceId: '2b', content: 'đẹp', isCorrect: true },
      { choiceId: '2c', content: 'nhanh', isCorrect: false },
      { choiceId: '2d', content: 'chậm', isCorrect: false },
    ],
  },
  {
    questionId: '3',
    questionText: 'Chọn ngữ pháp đúng để hoàn thành câu: "私は毎日__勉強します"',
    explanation: 'Dùng "に" để chỉ thời gian cụ thể trong một ngày.',
    choices: [
      { choiceId: '3a', content: 'で', isCorrect: false },
      { choiceId: '3b', content: 'に', isCorrect: true },
      { choiceId: '3c', content: 'を', isCorrect: false },
      { choiceId: '3d', content: 'が', isCorrect: false },
    ],
  },
];

class QuizService {
  private baseURL = BASE_URL; // Use the correct API URL
  
  async fetchRandomQuestions(request: GetRandomQuestionsRequestDto): Promise<RandomQuestionWithChoicesDto[]> {
    try {
      console.log('Fetching random questions with request:', request);
      
      // Try to call real API first
      try {
        const response = await axios.post<RandomQuestionWithChoicesDto[]>(
          `${this.baseURL}/questions/random`,
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
          console.log('Successfully fetched questions from API');
          return response.data;
        }
      } catch (apiError) {
        console.warn('API call failed, using mock data:', apiError);
      }
      
      // Fallback to mock data
      console.log('Using mock data for questions');
      const numberOfQuestions = Math.min(request.numberOfQuestions, mockQuestions.length);
      return mockQuestions.slice(0, numberOfQuestions);
      
    } catch (error) {
      console.error('Error in fetchRandomQuestions:', error);
      throw new Error('Không thể tải câu hỏi. Vui lòng kiểm tra kết nối mạng.');
    }
  }

  async submitQuizResults(result: QuizResult): Promise<void> {
    try {
      console.log('Submitting quiz results:', result);
      
      // Store results locally first
      const existingResults = await this.getLocalQuizResults();
      const updatedResults = [...existingResults, result];
      await AsyncStorage.setItem('quizResults', JSON.stringify(updatedResults));
      
      // Try to submit to server (optional)
      try {
        await axios.post(`${this.baseURL}/quiz/results`, result, {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
          },
        });
        console.log('Quiz results submitted to server successfully');
      } catch (serverError) {
        console.warn('Failed to submit to server, saved locally:', serverError);
      }
      
    } catch (error) {
      console.error('Error submitting quiz results:', error);
      // Don't throw error here as local storage is the fallback
    }
  }

  async getLocalQuizResults(): Promise<QuizResult[]> {
    try {
      const results = await AsyncStorage.getItem('quizResults');
      return results ? JSON.parse(results) : [];
    } catch (error) {
      console.error('Error getting local quiz results:', error);
      return [];
    }
  }

  async clearLocalQuizResults(): Promise<void> {
    try {
      await AsyncStorage.removeItem('quizResults');
      console.log('Local quiz results cleared');
    } catch (error) {
      console.error('Error clearing local quiz results:', error);
    }
  }

  // Helper methods for content mapping
  getContentNameLabel(contentName: ContentName): string {
    const labels = {
      [ContentName.Kanji]: 'Chữ Hán',
      [ContentName.Vocabulary]: 'Từ Vựng',
      [ContentName.Grammar]: 'Ngữ Pháp',
      [ContentName.Reading]: 'Đọc Hiểu',
      [ContentName.Listening]: 'Nghe Hiểu',
    };
    return labels[contentName] || 'Unknown';
  }

  getCourseLevelLabel(level: CourseLevel): string {
    const labels = {
      [CourseLevel.N5]: 'N5',
      [CourseLevel.N4]: 'N4',
      [CourseLevel.N3]: 'N3',
      [CourseLevel.N2]: 'N2',
      [CourseLevel.N1]: 'N1',
    };
    return labels[level] || 'Unknown';
  }

  getSubContentNameLabel(subContentName: SubContentName): string {
    const labels = {
      [SubContentName.Mondai1]: 'Đọc chữ Hán',
      [SubContentName.Mondai2]: 'Nhớ chữ Hán',
      [SubContentName.Mondai3]: 'Chọn từ phù hợp với câu',
      [SubContentName.Mondai4]: 'Tìm câu có cách diễn đạt giống',
      [SubContentName.Mondai5]: 'Chọn ngữ pháp phù hợp với câu',
      [SubContentName.Mondai6]: 'Sắp xếp câu',
      [SubContentName.Mondai7]: 'Tìm đáp án đúng để hoàn thành đoạn văn',
      [SubContentName.Mondai8]: 'Đoạn văn ngắn',
      [SubContentName.Mondai9]: 'Trung văn',
      [SubContentName.Mondai10]: 'Tìm kiếm thông tin',
      [SubContentName.Mondai11]: 'Hiểu đề bài',
      [SubContentName.Mondai12]: 'Hiểu điểm chính',
      [SubContentName.Mondai13]: 'Diễn đạt bằng lời nói',
      [SubContentName.Mondai14]: 'Phản hồi tức thời',
    };
    return labels[subContentName] || 'Unknown';
  }
}

// Export singleton instance
export const quizService = new QuizService();
export default quizService;

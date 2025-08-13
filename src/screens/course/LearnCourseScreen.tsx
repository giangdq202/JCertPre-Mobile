// // src/screens/course/LearnCourseScreen.tsx
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   Linking,
// } from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import { getCourseById } from "../../services/courseService";
// import { getLessonsByCourseId, Lesson } from "../../services/lessonService";
// import { getDocumentsByLessonId } from "../../services/documentService";
// import { getByLessonId } from "../../services/testService";
// import { livestreamApi } from "../../services/livestreamService";
// import { useAuth } from "../../auth/AuthContext";
// import dayjs from "dayjs";
// import { VideoLessonPlayer } from "../../components/VideoLessonPlayer";
// import { TestInterface } from "../../components/TestInterface";

// const LearnCourseScreen: React.FC = () => {
//   const route = useRoute();
//   const navigation = useNavigation();
//   const { courseId } = route.params as { courseId: string };

//   const [course, setCourse] = useState<any>(null);
//   const [lessons, setLessons] = useState<Lesson[]>([]);
//   const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
//   const [documents, setDocuments] = useState<any[]>([]);
//   const [lessonTests, setLessonTests] = useState<{ [key: string]: any }>({});
//   const [livestreams, setLivestreams] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [activeTest, setActiveTest] = useState<any | null>(null);
//   const [showTestInterface, setShowTestInterface] = useState(false);

//   const { isLoading: authLoading } = useAuth();

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         const courseData = await getCourseById(courseId);
//         setCourse(courseData);

//         const lessonData = await getLessonsByCourseId(courseId);
//         setLessons(lessonData);
//         if (lessonData.length > 0) setSelectedLessonId(lessonData[0].lessonId);

//         const livestreamData = await livestreamApi.getLivestreamsByCourse(
//           courseId
//         );
//         setLivestreams(livestreamData);
//       } catch (err) {
//         Alert.alert("Lỗi", "Không thể tải dữ liệu khóa học.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [courseId]);

//   useEffect(() => {
//     if (!selectedLessonId) return;

//     const fetchLessonDetails = async () => {
//       try {
//         const docs = await getDocumentsByLessonId(selectedLessonId);
//         setDocuments(docs);

//         const test = await getByLessonId(selectedLessonId);
//         setLessonTests((prev) => ({ ...prev, [selectedLessonId]: test }));
//       } catch (err) {
//         console.error("Error fetching lesson details:", err);
//       }
//     };

//     fetchLessonDetails();
//   }, [selectedLessonId]);

//   const handleStartTest = (test: any) => {
//     setActiveTest(test);
//     setShowTestInterface(true);
//   };

//   if (loading || authLoading) {
//     return (
//       <View className="flex-1 justify-center items-center">
//         <ActivityIndicator size="large" color="#3b82f6" />
//         <Text className="mt-2">Đang tải khóa học...</Text>
//       </View>
//     );
//   }

//   const selectedLesson = lessons.find((l) => l.lessonId === selectedLessonId);
//   const videoDocument = documents.find((d) => d.fileUrl?.includes("video"));

//   return (
//     <ScrollView className="flex-1 bg-gray-50 p-4">
//       {/* Course title */}
//       <Text className="text-2xl font-bold text-gray-800 mb-4">
//         {course?.title}
//       </Text>

//       {/* Video Player */}
//       {videoDocument ? (
//         <VideoLessonPlayer
//           courseId={courseId}
//           lessonId={selectedLessonId!}
//           lessonTitle={selectedLesson?.title || ""}
//           videoUrl={videoDocument.fileUrl}
//         />
//       ) : (
//         <View className="h-64 bg-gray-300 flex items-center justify-center rounded-lg mb-4">
//           <Text className="text-gray-500">Không có video cho bài học này</Text>
//         </View>
//       )}

//       {/* Lesson description */}
//       {selectedLesson?.content && (
//         <View className="bg-white p-4 rounded-lg mb-4">
//           <Text className="font-semibold text-gray-800 mb-2">
//             Mô tả bài học
//           </Text>
//           <Text className="text-gray-700">{selectedLesson.content}</Text>
//         </View>
//       )}

//       {/* Documents */}
//       {documents.length > 0 && (
//         <View className="bg-white p-4 rounded-lg mb-4">
//           <Text className="font-semibold text-gray-800 mb-2">Tài liệu</Text>
//           {documents.map((doc, index) => (
//             <View
//               key={doc.documentId}
//               className="flex-row justify-between items-center mb-2"
//             >
//               <Text className="text-gray-700">Tài liệu Bài {index + 1}</Text>
//               <TouchableOpacity
//                 className="bg-green-600 px-3 py-1 rounded"
//                 onPress={() => Linking.openURL(doc.fileUrl)}
//               >
//                 <Text className="text-white">Tải</Text>
//               </TouchableOpacity>
//             </View>
//           ))}
//         </View>
//       )}

//       {/* Tests */}
//       {lessonTests[selectedLessonId] && (
//         <View className="bg-white p-4 rounded-lg mb-4">
//           <Text className="font-semibold text-gray-800 mb-2">Bài kiểm tra</Text>
//           <TouchableOpacity
//             className="bg-blue-600 px-4 py-2 rounded"
//             onPress={() => handleStartTest(lessonTests[selectedLessonId]!)}
//           >
//             <Text className="text-white">Làm bài test</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {/* Livestreams */}
//       {livestreams.length > 0 && (
//         <View className="bg-white p-4 rounded-lg mb-4">
//           <Text className="font-semibold text-gray-800 mb-2">
//             Lịch livestream
//           </Text>
//           {livestreams.map((livestream) => (
//             <View
//               key={livestream.livestreamId}
//               className="flex-row justify-between items-center mb-2"
//             >
//               <View>
//                 <Text className="text-gray-800">
//                   {livestream.description || "Buổi học trực tuyến"}
//                 </Text>
//                 <Text className="text-gray-500 text-sm">
//                   {dayjs(livestream.scheduledDateTime).format(
//                     "DD/MM/YYYY HH:mm"
//                   )}
//                 </Text>
//               </View>
//               <TouchableOpacity
//                 className="bg-green-600 px-3 py-1 rounded"
//                 onPress={() => Alert.alert("Tham gia Livestream")}
//               >
//                 <Text className="text-white">Tham gia</Text>
//               </TouchableOpacity>
//             </View>
//           ))}
//         </View>
//       )}

//       {/* Test Interface Modal */}
//       {showTestInterface && activeTest && (
//         <TestInterface
//           test={activeTest}
//           lessonId={selectedLessonId!}
//           courseId={courseId}
//           onBack={() => setShowTestInterface(false)}
//         />
//       )}
//     </ScrollView>
//   );
// };

// export default LearnCourseScreen;

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ImageBackground,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../navigation/types";
import Icon from "react-native-vector-icons/Feather";
import { useAuth } from "../../auth/AuthContext";
import backgroundImage from "../../assets/flashcard.jpg";

// Services
import { TestType, CourseLevel } from "../../services/testService";
import {
  getAllTestTemplateTypes,
  TestTemplateTypeDto,
  TestType as TemplateTestType,
} from "../../services/testTemplateTypeService";
import {
  getAllByTypeId as getTemplatesByTypeId,
  TestTemplateDto,
} from "../../services/testTemplateService";
import {
  getAllByTemplateId as getConfigsByTemplateId,
  TestTemplateConfigDto,
} from "../../services/testTemplateConfigService";
import {
  getStudentProfile,
  StudentProfileDto,
} from "../../services/studentProfileService";
import {
  getMyEnrollments,
  EnrollmentDetailDto,
} from "../../services/enrollmentService";

interface TestOption {
  id: string;
  title: string;
  testType: TestType;
  courseLevel: CourseLevel;
  estimatedDuration: number;
  templates: TestTemplateDto[];
}

const TestScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { userInfo } = useAuth();

  const [selectedTest, setSelectedTest] = useState<TestOption | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [studentProfile, setStudentProfile] =
    useState<StudentProfileDto | null>(null);
  const [enrollments, setEnrollments] = useState<EnrollmentDetailDto[]>([]);
  const [hasEnrollments, setHasEnrollments] = useState<boolean>(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState<boolean>(true);
  const [testOptions, setTestOptions] = useState<TestOption[]>([]);

  // Helper function to get CourseLevel from string
  const getCourseLevelFromString = (levelString: string): CourseLevel => {
    switch (levelString) {
      case "N5":
        return CourseLevel.N5;
      case "N4":
        return CourseLevel.N4;
      case "N3":
        return CourseLevel.N3;
      case "N2":
        return CourseLevel.N2;
      case "N1":
        return CourseLevel.N1;
      default:
        return CourseLevel.N5;
    }
  };

  // Helper function to check if test level is allowed for user
  const isTestLevelAllowed = (
    testLevel: CourseLevel,
    userLevel: CourseLevel
  ): boolean => {
    // Allow user to take test at their current level or any lower level (easier)
    // This is more flexible than the previous restrictive approach
    if (testLevel === userLevel) return true;

    const levelProgression = [
      CourseLevel.N5,
      CourseLevel.N4,
      CourseLevel.N3,
      CourseLevel.N2,
      CourseLevel.N1,
    ];
    const userIndex = levelProgression.indexOf(userLevel);
    const testIndex = levelProgression.indexOf(testLevel);

    // Allow current level, one level up (challenge), or any level down (review)
    return testIndex <= userIndex + 1;
  };

  // Check if user has any enrollments
  const checkEnrollments = async () => {
    if (!userInfo?.id) return;

    try {
      setCheckingEnrollment(true);

      if (__DEV__) {
        console.log("Checking enrollments for user:", userInfo.id);
      }

      const enrollmentList = await getMyEnrollments();

      if (__DEV__) {
        console.log("Enrollments loaded:", enrollmentList);
      }

      setEnrollments(enrollmentList);
      setHasEnrollments(enrollmentList.length > 0);

      if (enrollmentList.length === 0) {
        setErrorMsg(
          "Bạn cần đăng ký ít nhất một khóa học để có thể làm bài test. Vui lòng đăng ký khóa học trước khi tiếp tục."
        );
      }
    } catch (error: any) {
      // console.error("Error checking enrollments:", error);
      if (__DEV__) {
        console.log("Error checking enrollments:", error);
        if (error.response) {
          console.log("Response status:", error.response.status);
          console.log("Response data:", error.response.data);
        }
      }
      setErrorMsg(
        "Không thể kiểm tra thông tin đăng ký khóa học. Vui lòng thử lại sau."
      );
    } finally {
      setCheckingEnrollment(false);
    }
  };

  // Load student profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userInfo?.id) return;

      try {
        if (__DEV__) {
          console.log("Fetching student profile for user:", userInfo.id);
        }

        const profile = await getStudentProfile(userInfo.id);

        if (__DEV__) {
          console.log("Student profile loaded:", profile);
        }

        setStudentProfile(profile);
      } catch (err: any) {
        // console.error("Error fetching student profile:", err);
        if (__DEV__) {
          console.log("Error fetching student profile:", err);
          if (err.response) {
            console.log("Response status:", err.response.status);
            console.log("Response data:", err.response.data);
          }
        }
        setStudentProfile({
          userId: userInfo.id,
          currentLevel: "N5",
          learningGoals: "Cải thiện trình độ tiếng Nhật",
        } as StudentProfileDto);
      }
    };

    const initializeData = async () => {
      await Promise.all([fetchProfile(), checkEnrollments()]);
    };

    initializeData();
  }, [userInfo?.id]);

  // Create fallback test options when API fails
  const createFallbackTestOptions = (userLevel: CourseLevel): TestOption[] => {
    const fallbackOptions: TestOption[] = [];

    // Create basic test options based on user's current level and enrollments
    const levels = [
      CourseLevel.N5,
      CourseLevel.N4,
      CourseLevel.N3,
      CourseLevel.N2,
      CourseLevel.N1,
    ];

    for (const level of levels) {
      if (isTestLevelAllowed(level, userLevel)) {
        fallbackOptions.push({
          id: `fallback_${level}_${Date.now()}`,
          title: `JLPT ${CourseLevel[level]} - Bài thi thử`,
          testType: TestType.JLPTAuto,
          courseLevel: level,
          estimatedDuration: 60, // Default 60 minutes
          templates: [], // Empty templates array
        });
      }
    }

    return fallbackOptions;
  };

  // Load available options from template types, templates and configs
  useEffect(() => {
    const loadOptions = async () => {
      if (!studentProfile || !hasEnrollments || checkingEnrollment) return;

      // Don't load if user has no enrollments
      if (enrollments.length === 0) {
        setTestOptions([]);
        return;
      }

      setLoading(true);
      setErrorMsg("");
      try {
        // Log để debug
        // if (__DEV__) {
        //   console.log("Loading test options...");
        //   console.log("Student profile:", studentProfile);
        //   console.log("Has enrollments:", hasEnrollments);
        //   console.log("Enrollments count:", enrollments.length);
        // }

        const jlptTypes = await getAllTestTemplateTypes({
          type: TemplateTestType.JLPTAuto,
          isActive: true,
          pageSize: 100,
        });

        if (__DEV__) {
          console.log("JLPT types loaded:", jlptTypes);
        }

        const allTypes: TestTemplateTypeDto[] = jlptTypes.items;
        const userCurrentLevel = getCourseLevelFromString(
          studentProfile.currentLevel
        );

        if (__DEV__) {
          console.log("User current level:", userCurrentLevel);
          console.log("All types count:", allTypes.length);
        }

        const options: TestOption[] = [];

        for (const type of allTypes) {
          const testLevel = type.courseLevel as CourseLevel;

          if (!isTestLevelAllowed(testLevel, userCurrentLevel)) {
            if (__DEV__) {
              console.log(`Skipping type ${type.typeName} - level not allowed`);
            }
            continue;
          }

          try {
            const templates: TestTemplateDto[] = await getTemplatesByTypeId(
              type.testTemplateTypeId
            );

            if (__DEV__) {
              console.log(`Templates for type ${type.typeName}:`, templates);
            }

            const validTemplates: TestTemplateDto[] = [];
            for (const template of templates) {
              try {
                const configs: TestTemplateConfigDto[] =
                  await getConfigsByTemplateId(template.templateId);
                if (configs && configs.length > 0) {
                  validTemplates.push(template);
                }
              } catch (configError) {
                if (__DEV__) {
                  console.log(
                    `Error loading configs for template ${template.templateId}:`,
                    configError
                  );
                }
                // Continue with other templates
              }
            }

            if (validTemplates.length > 0) {
              const avgDuration =
                validTemplates.reduce(
                  (sum, template) => sum + (template.durationMinutes || 0),
                  0
                ) / validTemplates.length;

              options.push({
                id: type.testTemplateTypeId,
                title: type.typeName,
                testType: type.testType as TestType,
                courseLevel: type.courseLevel as CourseLevel,
                estimatedDuration: Math.round(avgDuration),
                templates: validTemplates,
              });
            }
          } catch (templateError) {
            if (__DEV__) {
              console.log(
                `Error loading templates for type ${type.typeName}:`,
                templateError
              );
            }
            // Continue with other types
          }
        }

        if (__DEV__) {
          console.log("Final options:", options);
        }

        setTestOptions(options);
      } catch (err: any) {
        // Không log error để tránh popup
        // console.error("Failed to load exam options:", err);
        if (__DEV__) {
          console.log("Failed to load exam options:", err);
          if (err.response) {
            console.log("Response status:", err.response.status);
            console.log("Response data:", err.response.data);
          }
        }

        // If API fails with 403, create fallback options instead of showing error
        if (err.response?.status === 403) {
          if (__DEV__) {
            console.log("API returned 403, creating fallback test options");
          }

          const userCurrentLevel = getCourseLevelFromString(
            studentProfile.currentLevel
          );
          const fallbackOptions = createFallbackTestOptions(userCurrentLevel);

          if (fallbackOptions.length > 0) {
            setTestOptions(fallbackOptions);
            setErrorMsg(""); // Clear any error message
            if (__DEV__) {
              console.log("Fallback options created:", fallbackOptions);
            }
          } else {
            setErrorMsg("Không thể tạo bài test phù hợp với trình độ của bạn.");
          }
        } else {
          // Provide more specific error messages for other errors
          let errorMessage =
            "Không thể tải danh sách bài test. Vui lòng thử lại sau.";

          if (err.response?.status === 401) {
            errorMessage =
              "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
          } else if (err.response?.status === 404) {
            errorMessage =
              "Không tìm thấy bài test nào phù hợp với trình độ của bạn.";
          } else if (err.response?.status === 500) {
            errorMessage = "Lỗi hệ thống. Vui lòng thử lại sau.";
          }

          setErrorMsg(errorMessage);
          setTestOptions([]);
        }
      } finally {
        setLoading(false);
      }
    };
    loadOptions();
  }, [studentProfile, hasEnrollments, checkingEnrollment, enrollments.length]);

  const handleStartTest = (testOption: TestOption) => {
    navigation.navigate("TestDetail", { testOption });
  };

  const handleViewHistory = (testOption: TestOption) => {
    navigation.navigate("TestHistory", {
      testTemplateTypeId: testOption.id,
      testTemplateTypeName: testOption.title,
    });
  };

  const getLevelColor = (level: CourseLevel) => {
    switch (level) {
      case CourseLevel.N5:
        return "#10B981";
      case CourseLevel.N4:
        return "#3B82F6";
      case CourseLevel.N3:
        return "#F59E0B";
      case CourseLevel.N2:
        return "#EF4444";
      case CourseLevel.N1:
        return "#8B5CF6";
      default:
        return "#6B7280";
    }
  };

  if (loading || checkingEnrollment) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>
          {checkingEnrollment
            ? "Đang kiểm tra đăng ký khóa học..."
            : "Đang tải danh sách bài test..."}
        </Text>
      </View>
    );
  }

  // Check if user is authenticated
  if (!userInfo?.id) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={48} color="#EF4444" />
        <Text style={styles.errorTitle}>Chưa đăng nhập</Text>
        <Text style={styles.errorMessage}>
          Vui lòng đăng nhập để sử dụng tính năng bài test
        </Text>
      </View>
    );
  }

  // Check if there's an error message
  if (errorMsg) {
    return (
      <ImageBackground
        source={backgroundImage}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.errorContainer}>
          <Text style={styles.errorMessage}>{errorMsg}</Text>
          <TouchableOpacity
            onPress={() => {
              setErrorMsg("");
              setCheckingEnrollment(true);
              setTestOptions([]);
              // Reload both enrollments and test options
              checkEnrollments();
              // Also reload test options after a short delay
              setTimeout(() => {
                if (hasEnrollments) {
                  setLoading(true);
                  // Trigger the loadOptions effect by updating dependencies
                  setCheckingEnrollment(false);
                }
              }, 1000);
            }}
          ></TouchableOpacity>

          {/* Debug info in development */}
          {/* {__DEV__ && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugTitle}>Debug Info:</Text>
            <Text style={styles.debugText}>User ID: {userInfo?.id}</Text>
            <Text style={styles.debugText}>
              Student Profile: {studentProfile ? "Loaded" : "Not loaded"}
            </Text>
            <Text style={styles.debugText}>
              Current Level: {studentProfile?.currentLevel || "Unknown"}
            </Text>
            <Text style={styles.debugText}>
              Has Enrollments: {hasEnrollments ? "Yes" : "No"}
            </Text>
            <Text style={styles.debugText}>
              Enrollments Count: {enrollments.length}
            </Text>
            <Text style={styles.debugText}>
              Test Options Count: {testOptions.length}
            </Text>

            <TouchableOpacity
              style={styles.debugButton}
              onPress={() => {
                if (__DEV__) {
                  console.log("=== MANUAL DEBUG TRIGGER ===");
                  console.log("Current state:", {
                    userInfo,
                    studentProfile,
                    hasEnrollments,
                    enrollments,
                    testOptions,
                  });
                }
              }}
            >
              <Text style={styles.debugButtonText}>Log Current State</Text>
            </TouchableOpacity>
          </View>
        )} */}

          {/* Support contact info */}
          <View style={styles.supportContainer}>
            <Text style={styles.supportText}>
              Nếu vấn đề vẫn tiếp tục, vui lòng liên hệ hỗ trợ:
            </Text>
            <Text style={styles.supportEmail}>support@jcertpre.com</Text>
          </View>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bài Thi JLPT</Text>
        <Text style={styles.subtitle}>
          Chọn bài thi phù hợp với trình độ của bạn
        </Text>
      </View>

      {testOptions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="file-text" size={48} color="#9CA3AF" />
          <Text style={styles.emptyText}>
            {!hasEnrollments
              ? "Bạn cần đăng ký ít nhất một khóa học để có thể làm bài test"
              : "Không có bài thi nào khả dụng"}
          </Text>
          <Text style={styles.emptySubtext}>
            {!hasEnrollments
              ? "Vui lòng đăng ký khóa học trước khi tiếp tục"
              : "Vui lòng kiểm tra lại sau hoặc liên hệ hỗ trợ"}
          </Text>

          {!hasEnrollments && (
            <TouchableOpacity
              style={styles.enrollButton}
              onPress={() =>
                navigation.navigate("MainTabs", { screen: "Course" })
              }
            >
              <Text style={styles.enrollButtonText}>Đăng ký khóa học ngay</Text>
            </TouchableOpacity>
          )}

          {/* Debug info in development */}
          {/* {__DEV__ && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugTitle}>Debug Info:</Text>
              <Text style={styles.debugText}>User ID: {userInfo?.id}</Text>
              <Text style={styles.debugText}>
                Student Profile: {studentProfile ? "Loaded" : "Not loaded"}
              </Text>
              <Text style={styles.debugText}>
                Has Enrollments: {hasEnrollments ? "Yes" : "No"}
              </Text>
              <Text style={styles.debugText}>
                Enrollments Count: {enrollments.length}
              </Text>
              <Text style={styles.debugText}>
                Test Options Count: {testOptions.length}
              </Text>

              <TouchableOpacity
                style={styles.debugButton}
                onPress={() => {
                  if (__DEV__) {
                    console.log("=== MANUAL DEBUG TRIGGER ===");
                    console.log("Current state:", {
                      userInfo,
                      studentProfile,
                      hasEnrollments,
                      enrollments,
                      testOptions,
                    });
                  }
                }}
              >
                <Text style={styles.debugButtonText}>Log Current State</Text>
              </TouchableOpacity>
            </View>
          )} */}
        </View>
      ) : (
        <>
          {testOptions.map((testOption) => (
            <View key={testOption.id} style={styles.testCard}>
              <View style={styles.testHeader}>
                <View style={styles.testTypeContainer}>
                  <Icon name="book" size={20} color="#3B82F6" />
                  <Text style={styles.testTypeText}>JLPT</Text>
                </View>
                <View
                  style={[
                    styles.levelBadge,
                    {
                      backgroundColor:
                        getLevelColor(testOption.courseLevel) + "20",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.levelText,
                      { color: getLevelColor(testOption.courseLevel) },
                    ]}
                  >
                    {CourseLevel[testOption.courseLevel]}
                  </Text>
                </View>
              </View>

              <Text style={styles.testTitle}>{testOption.title}</Text>
              <Text style={styles.testDescription}>
                Bài thi thử JLPT theo cấu hình hệ thống
              </Text>

              <View style={styles.testInfo}>
                <View style={styles.infoItem}>
                  <Icon name="clock" size={16} color="#6B7280" />
                  <Text style={styles.infoText}>
                    ~{testOption.estimatedDuration} phút
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Icon name="users" size={16} color="#6B7280" />
                  <Text style={styles.infoText}>
                    Cấp độ {CourseLevel[testOption.courseLevel]}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.startButton}
                onPress={() => handleStartTest(testOption)}
              >
                <Icon name="play" size={16} color="#FFFFFF" />
                <Text style={styles.startButtonText}>Bắt đầu làm bài</Text>
              </TouchableOpacity>

              {/* <TouchableOpacity
                style={styles.historyButton}
                onPress={() => handleViewHistory(testOption)}
              >
                <Icon name="clock" size={16} color="#6B7280" />
                <Text style={styles.historyButtonText}>Xem lịch sử</Text>
              </TouchableOpacity> */}
            </View>
          ))}

          {/* Test Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Hướng dẫn làm bài</Text>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionText}>
                • Bài thi sẽ được chia thành nhiều phần (Part) với thời gian
                riêng biệt
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionText}>
                • Bạn không thể làm Part tiếp theo khi Part hiện tại chưa hết
                thời gian
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionText}>
                • Bạn không thể quay lại Part trước khi Part hiện tại chưa hết
                thời gian
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionText}>
                • Hệ thống sẽ tự động nộp bài khi hết thời gian tổng
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionText}>
                • Câu trả lời sẽ được lưu tự động khi bạn chọn
              </Text>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
  header: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
  },
  errorContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: "#98eaaaff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#368a56ff",
    marginTop: 350,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    textAlign: "center",
  },
  emptyContainer: {
    margin: 20,
    padding: 24,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    alignItems: "center",
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 8,
  },
  testCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  testTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  testTypeText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#3B82F6",
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  levelText: {
    fontSize: 12,
    fontWeight: "500",
  },
  testTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  testDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  testInfo: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  infoText: {
    fontSize: 14,
    color: "#6B7280",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  historyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  historyButtonText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500",
  },
  instructionsContainer: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
    textAlign: "center",
  },
  instructionItem: {
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#EF4444",
    marginTop: 10,
    marginBottom: 5,
  },
  errorMessage: {
    fontSize: 14,
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  debugContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#E0E0E0",
    borderRadius: 5,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  debugText: {
    fontSize: 13,
    color: "#555",
    marginBottom: 2,
  },
  debugButton: {
    backgroundColor: "#4F46E5",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  debugButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  noEnrollmentContainer: {
    margin: 20,
    padding: 24,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    alignItems: "center",
  },
  noEnrollmentEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  noEnrollmentTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  noEnrollmentText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  enrollButton: {
    backgroundColor: "#10B981",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  enrollButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  supportContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    alignItems: "center",
  },
  supportText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 8,
  },
  supportEmail: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "500",
  },
  background: { flex: 1, backgroundColor: "#FFFFFF" },
});

export default TestScreen;
